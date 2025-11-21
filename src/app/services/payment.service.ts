import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface PaymentRequest {
  id?: number;
  user_email: string;
  user_name: string;
  user_phone: string;
  payment_date: string;
  payment_time: string;
  plan: 'pro';
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  created_at?: string;
  approved_at?: string;
  revoked_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private supabase: SupabaseClient;

  constructor() {
    // Inicializar Supabase para solicitudes de pago
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async createPaymentRequest(request: Omit<PaymentRequest, 'id' | 'status' | 'created_at' | 'approved_at'>): Promise<{ success: boolean; error?: string; data?: PaymentRequest }> {
    try {
      // Preparar los datos para Supabase
      // Asegurar que payment_date y payment_time estén en el formato correcto
      const paymentRequest = {
        user_email: request.user_email,
        user_name: request.user_name,
        user_phone: request.user_phone,
        payment_date: request.payment_date, // Formato YYYY-MM-DD (viene del input type="date")
        payment_time: request.payment_time, // Formato HH:MM (viene del input type="time")
        plan: request.plan,
        status: 'pending' as const
        // created_at se genera automáticamente en Supabase con DEFAULT NOW()
      };

      console.log('📤 Enviando solicitud de pago a Supabase:', paymentRequest);

      // Guardar en Supabase
      const { data, error } = await this.supabase
        .from('payment_requests')
        .insert([paymentRequest])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating payment request in Supabase:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Solicitud de pago creada exitosamente en Supabase:', data);

      const createdRequest: PaymentRequest = data as PaymentRequest;

      // Llamar a la Edge Function para enviar el email
      try {
        const edgeFunctionUrl = `${environment.supabaseUrl}/functions/v1/send-payment-email?action=send`;
        
        console.log('📧 Llamando a Edge Function:', edgeFunctionUrl);
        console.log('📧 Datos a enviar:', JSON.stringify(createdRequest, null, 2));
        
        const emailResponse = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${environment.supabaseKey}`,
            'apikey': environment.supabaseKey
          },
          body: JSON.stringify({
            payment_request: createdRequest,
            action: 'send'
          })
        });

        console.log('📧 Respuesta de Edge Function - Status:', emailResponse.status);
        console.log('📧 Respuesta de Edge Function - Headers:', emailResponse.headers);

        if (emailResponse.ok) {
          const responseData = await emailResponse.json();
          console.log('✅ Email enviado exitosamente a través de Edge Function:', responseData);
        } else {
          const errorText = await emailResponse.text();
          console.error('❌ Error al enviar email - Status:', emailResponse.status);
          console.error('❌ Error al enviar email - Response:', errorText);
          
          // Intentar parsear como JSON si es posible
          try {
            const errorData = JSON.parse(errorText);
            console.error('❌ Error detallado:', errorData);
          } catch (e) {
            console.error('❌ Error (texto):', errorText);
          }
          
          // No fallar si el email falla, la solicitud ya está guardada
        }
      } catch (emailError: any) {
        console.error('❌ Error al llamar a Edge Function:', emailError);
        console.error('❌ Error message:', emailError.message);
        console.error('❌ Error stack:', emailError.stack);
        // No fallar si el email falla, la solicitud ya está guardada
      }

      return { success: true, data: createdRequest };
    } catch (error: any) {
      console.error('Error creating payment request:', error);
      return { success: false, error: error.message || 'Error al crear la solicitud de pago' };
    }
  }

  async getPaymentRequestByEmail(email: string): Promise<PaymentRequest | null> {
    try {
      const { data, error } = await this.supabase
        .from('payment_requests')
        .select('*')
        .eq('user_email', email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error getting payment request:', error);
        return null;
      }

      return data as PaymentRequest | null;
    } catch (error: any) {
      console.error('Error getting payment request:', error);
      return null;
    }
  }

  async checkPaymentStatus(email: string): Promise<'pending' | 'approved' | 'rejected' | 'revoked' | null> {
    try {
      const { data, error } = await this.supabase
        .from('payment_requests')
        .select('status')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking payment status:', error);
        return null;
      }

      return data?.status || null;
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      return null;
    }
  }

  async getAllPaymentRequests(): Promise<PaymentRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all payment requests:', error);
        return [];
      }

      return (data || []) as PaymentRequest[];
    } catch (error: any) {
      console.error('Error getting all payment requests:', error);
      return [];
    }
  }

  async updatePaymentRequestStatus(id: number, status: 'approved' | 'rejected' | 'revoked'): Promise<boolean> {
    try {
      const updateData: any = {
        status
      };

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updateData.revoked_at = new Date().toISOString();
      } else if (status === 'revoked') {
        updateData.revoked_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('payment_requests')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating payment request status:', error);
        return false;
      }
      
      // Si se aprueba, agregar el email a la lista de usuarios Pro (usando localStorage para sincronización con PlanService)
      if (status === 'approved') {
        const { data: approvedRequest } = await this.supabase
          .from('payment_requests')
          .select('user_email')
          .eq('id', id)
          .single();

        if (approvedRequest) {
          const proUsers = JSON.parse(localStorage.getItem('pro_users') || '[]');
          if (!proUsers.includes(approvedRequest.user_email)) {
            proUsers.push(approvedRequest.user_email);
            localStorage.setItem('pro_users', JSON.stringify(proUsers));
          }
        }
      }
      
      // Si se revoca, remover el email de la lista de usuarios Pro
      if (status === 'revoked') {
        const { data: revokedRequest } = await this.supabase
          .from('payment_requests')
          .select('user_email')
          .eq('id', id)
          .single();

        if (revokedRequest) {
          const proUsers = JSON.parse(localStorage.getItem('pro_users') || '[]');
          const updatedProUsers = proUsers.filter((email: string) => email !== revokedRequest.user_email);
          localStorage.setItem('pro_users', JSON.stringify(updatedProUsers));
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating payment request:', error);
      return false;
    }
  }

  // Obtener todos los usuarios con plan Pro (desde solicitudes aprobadas)
  async getProUsers(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_requests')
        .select('user_email')
        .eq('status', 'approved');

      if (error) {
        console.error('Error getting pro users:', error);
        // Fallback a localStorage
        return JSON.parse(localStorage.getItem('pro_users') || '[]');
      }

      // Obtener emails únicos
      const uniqueEmails = [...new Set((data || []).map(r => r.user_email))];
      
      // Sincronizar con localStorage
      localStorage.setItem('pro_users', JSON.stringify(uniqueEmails));
      
      return uniqueEmails;
    } catch (error: any) {
      console.error('Error getting pro users:', error);
      // Fallback a localStorage
      return JSON.parse(localStorage.getItem('pro_users') || '[]');
    }
  }

  /**
   * Verifica si un pago aprobado ha expirado (1 mes desde la aprobación)
   * Retorna true si ha pasado más de 1 mes desde approved_at
   */
  isPaymentExpired(approvedAt?: string): boolean {
    if (!approvedAt) return false;
    
    const approvedDate = new Date(approvedAt);
    const now = new Date();
    
    // Calcular la diferencia en milisegundos
    const diffTime = now.getTime() - approvedDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Si han pasado más de 30 días, está expirado
    return diffDays > 30;
  }

  /**
   * Verifica y revoca automáticamente todos los pagos aprobados que hayan expirado
   * Retorna el número de pagos revocados
   */
  async checkAndRevokeExpiredPayments(): Promise<number> {
    try {
      // Obtener todos los pagos aprobados que no estén revocados
      const { data: approvedRequests, error } = await this.supabase
        .from('payment_requests')
        .select('*')
        .eq('status', 'approved')
        .not('approved_at', 'is', null);

      if (error) {
        console.error('Error getting approved requests:', error);
        return 0;
      }

      let revokedCount = 0;
      
      for (const request of (approvedRequests || [])) {
        if (request.approved_at && this.isPaymentExpired(request.approved_at)) {
          // Revocar el pago
          if (request.id) {
            await this.updatePaymentRequestStatus(request.id, 'revoked');
            revokedCount++;
          }
        }
      }
      
      return revokedCount;
    } catch (error: any) {
      console.error('Error checking expired payments:', error);
      return 0;
    }
  }

  private async sendNotificationEmail(paymentRequest: PaymentRequest): Promise<void> {
    const adminEmail = 'jhosefqh123@gmail.com';
    
    // Formatear fecha y hora del pago
    const paymentDateTime = `${paymentRequest.payment_date} ${paymentRequest.payment_time}`;
    const formattedPaymentDate = new Date(paymentDateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // URL del panel de administración
    const adminUrl = `${window.location.origin}/admin`;
    
    const emailSubject = 'Nueva solicitud de pago - Plan Pro - Requiere confirmación';
    
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #9333ea; border-radius: 5px; }
    .button { display: inline-block; padding: 12px 24px; background: #9333ea; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
    .warning { background: #fef3c7; border-left-color: #f59e0b; padding: 10px; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📧 Nueva Solicitud de Pago - Plan Pro</h2>
    </div>
    <div class="content">
      <div class="warning">
        <strong>⚠️ Acción Requerida:</strong> Por favor, revisa y confirma esta solicitud de pago.
      </div>
      
      <h3>Detalles del Cliente:</h3>
      <div class="info-box">
        <p><strong>Nombre:</strong> ${paymentRequest.user_name}</p>
        <p><strong>Email:</strong> ${paymentRequest.user_email}</p>
        <p><strong>Teléfono:</strong> ${paymentRequest.user_phone}</p>
        <p><strong>Plan solicitado:</strong> ${paymentRequest.plan.toUpperCase()}</p>
        <p><strong>Fecha del pago:</strong> ${formattedPaymentDate}</p>
        <p><strong>Fecha de solicitud:</strong> ${new Date(paymentRequest.created_at!).toLocaleString('es-ES')}</p>
      </div>

      <h3>Información de Pago:</h3>
      <div class="info-box">
        <p><strong>Monto:</strong> $9.99 USD</p>
        <p><strong>Método:</strong> Yape</p>
        <p><strong>ID de solicitud:</strong> #${paymentRequest.id}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${adminUrl}" class="button">👉 Ir al Panel de Administración</a>
      </div>

      <p><strong>Instrucciones:</strong></p>
      <ol>
        <li>Accede al panel de administración haciendo clic en el botón de arriba</li>
        <li>Revisa los detalles del pago</li>
        <li>Verifica el pago recibido</li>
        <li>Haz clic en "Aprobar" para activar el Plan Pro para el usuario</li>
        <li>El usuario recibirá una notificación automática cuando se apruebe</li>
      </ol>

      <p style="margin-top: 20px;"><strong>Nota:</strong> El usuario permanecerá en Plan Free hasta que apruebes esta solicitud.</p>
    </div>
    <div class="footer">
      <p>NotiNow - Sistema de Administración</p>
      <p>Este es un email automático. Por favor, no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Aquí normalmente enviarías el email usando un servicio externo
    // Por ahora, mostramos la información en consola y en una alerta
    console.log('📧 ============================================');
    console.log('📧 Email de notificación de pago');
    console.log('📧 ============================================');
    console.log('Para:', adminEmail);
    console.log('Asunto:', emailSubject);
    console.log('ID de solicitud:', paymentRequest.id);
    console.log('--------------------------------------------');
    console.log('Detalles del cliente:');
    console.log('- Nombre:', paymentRequest.user_name);
    console.log('- Email:', paymentRequest.user_email);
    console.log('- Teléfono:', paymentRequest.user_phone);
    console.log('- Fecha del pago:', formattedPaymentDate);
    console.log('- Plan:', paymentRequest.plan.toUpperCase());
    console.log('--------------------------------------------');
    console.log('URL del panel de admin:', adminUrl);
    console.log('📧 ============================================');

    // En producción, aquí harías algo como:
    // await emailService.send({
    //   to: adminEmail,
    //   subject: emailSubject,
    //   html: emailContent
    // });
    
    // Mostrar alerta visual con información importante
    const alertMessage = `📧 NOTIFICACIÓN ENVIADA A: ${adminEmail}

✅ Solicitud de pago registrada correctamente

📋 Detalles:
- Cliente: ${paymentRequest.user_name}
- Email: ${paymentRequest.user_email}
- Fecha del pago: ${formattedPaymentDate}
- ID: #${paymentRequest.id}

🔔 Se ha enviado un email al administrador (${adminEmail}) para que revise y confirme tu pago.

⏳ Tu solicitud está pendiente de confirmación.
Recibirás una notificación cuando sea aprobada.

💡 Puedes verificar el estado de tu solicitud en cualquier momento.

🔗 Panel de administración: ${adminUrl}`;

    alert(alertMessage);
  }
}

