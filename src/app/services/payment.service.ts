import { Injectable } from '@angular/core';

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
  // No usamos Supabase para pagos, solo localStorage

  async createPaymentRequest(request: Omit<PaymentRequest, 'id' | 'status' | 'created_at' | 'approved_at'>): Promise<{ success: boolean; error?: string; data?: PaymentRequest }> {
    try {
      const paymentRequest: PaymentRequest = {
        id: Date.now(), // ID temporal único
        ...request,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Guardar en localStorage
      const existing = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      existing.push(paymentRequest);
      localStorage.setItem('payment_requests', JSON.stringify(existing));

      // Enviar email de notificación (simulado - en producción usarías un servicio real)
      await this.sendNotificationEmail(paymentRequest);

      return { success: true, data: paymentRequest };
    } catch (error: any) {
      console.error('Error creating payment request:', error);
      return { success: false, error: error.message };
    }
  }

  async getPaymentRequestByEmail(email: string): Promise<PaymentRequest | null> {
    try {
      const requests: PaymentRequest[] = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      const request = requests
        .filter(r => r.user_email === email && r.status === 'pending')
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())[0];
      return request || null;
    } catch (error: any) {
      console.error('Error getting payment request:', error);
      return null;
    }
  }

  async checkPaymentStatus(email: string): Promise<'pending' | 'approved' | 'rejected' | 'revoked' | null> {
    try {
      const requests: PaymentRequest[] = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      
      // Obtener todas las solicitudes del usuario ordenadas por fecha (más reciente primero)
      const userRequests = requests
        .filter(r => r.user_email === email)
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      
      if (userRequests.length === 0) return null;
      
      // Retornar el estado de la solicitud más reciente
      return userRequests[0].status;
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      return null;
    }
  }

  async getAllPaymentRequests(): Promise<PaymentRequest[]> {
    try {
      const requests: PaymentRequest[] = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      return requests.sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    } catch (error: any) {
      console.error('Error getting all payment requests:', error);
      return [];
    }
  }

  async updatePaymentRequestStatus(id: number, status: 'approved' | 'rejected' | 'revoked'): Promise<boolean> {
    try {
      const requests: PaymentRequest[] = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      const updated = requests.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status,
            approved_at: status === 'approved' ? new Date().toISOString() : r.approved_at,
            revoked_at: status === 'revoked' ? new Date().toISOString() : r.revoked_at
          };
        }
        return r;
      });
      localStorage.setItem('payment_requests', JSON.stringify(updated));
      
      // Si se aprueba, agregar el email a la lista de usuarios Pro
      if (status === 'approved') {
        const approvedRequest = requests.find(r => r.id === id);
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
        const revokedRequest = requests.find(r => r.id === id);
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

  // Obtener todos los usuarios con plan Pro
  getProUsers(): string[] {
    return JSON.parse(localStorage.getItem('pro_users') || '[]');
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
      const requests: PaymentRequest[] = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      let revokedCount = 0;
      
      // Filtrar solo los aprobados que no estén ya revocados
      const approvedRequests = requests.filter(r => r.status === 'approved' && r.approved_at);
      
      for (const request of approvedRequests) {
        if (this.isPaymentExpired(request.approved_at)) {
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
      <p>Portal de Noticias - Sistema de Administración</p>
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

