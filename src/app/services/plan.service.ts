import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type PlanType = 'free' | 'pro';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private readonly PLAN_KEY = 'user_plan';
  private readonly DEFAULT_PLAN: PlanType = 'free';
  private planSubject: BehaviorSubject<PlanType>;
  public plan$: Observable<PlanType>;

  constructor() {
    // Inicializar con el plan actual
    const initialPlan = this.getPlan();
    this.planSubject = new BehaviorSubject<PlanType>(initialPlan);
    this.plan$ = this.planSubject.asObservable();
  }

  getPlan(): PlanType {
    const plan = localStorage.getItem(this.PLAN_KEY);
    return (plan as PlanType) || this.DEFAULT_PLAN;
  }

  setPlan(plan: PlanType): void {
    localStorage.setItem(this.PLAN_KEY, plan);
    this.planSubject.next(plan);
  }

  isPro(): boolean {
    // Verificar primero si el usuario actual tiene plan Pro asignado por email
    const currentUserEmail = localStorage.getItem('current_user_email');
    if (currentUserEmail) {
      const proUsers = JSON.parse(localStorage.getItem('pro_users') || '[]');
      const hasPro = proUsers.includes(currentUserEmail);
      
      // Sincronizar el plan local con la lista de usuarios Pro
      if (hasPro) {
        const currentPlan = this.getPlan();
        if (currentPlan !== 'pro') {
          this.setPlan('pro');
        }
        return true;
      } else {
        // Si no está en la lista de Pro, forzar Free
        const currentPlan = this.getPlan();
        if (currentPlan !== 'free') {
          this.setPlan('free');
        }
        return false;
      }
    }
    // Si no hay email guardado, verificar el plan local (para compatibilidad)
    const plan = this.getPlan();
    this.planSubject.next(plan);
    return plan === 'pro';
  }

  isFree(): boolean {
    return this.getPlan() === 'free';
  }

  upgradeToPro(): void {
    this.setPlan('pro');
  }

  downgradeToFree(): void {
    this.setPlan('free');
  }

  // Revocar plan Pro de un usuario específico por email
  revokeProPlan(userEmail: string): void {
    // Guardar en localStorage qué usuarios tienen plan Pro
    const proUsers = JSON.parse(localStorage.getItem('pro_users') || '[]');
    const updated = proUsers.filter((email: string) => email !== userEmail);
    localStorage.setItem('pro_users', JSON.stringify(updated));
    
    // Si el usuario actual es el que se está revocando, cambiar su plan
    const currentUserEmail = localStorage.getItem('current_user_email');
    if (currentUserEmail === userEmail) {
      this.setPlan('free');
      // Forzar actualización del plan
      this.planSubject.next('free');
    }
  }

  // Asignar plan Pro a un usuario específico por email
  assignProPlan(userEmail: string): void {
    const proUsers = JSON.parse(localStorage.getItem('pro_users') || '[]');
    if (!proUsers.includes(userEmail)) {
      proUsers.push(userEmail);
      localStorage.setItem('pro_users', JSON.stringify(proUsers));
    }
    
    // Si es el usuario actual, actualizar su plan
    const currentUserEmail = localStorage.getItem('current_user_email');
    if (currentUserEmail === userEmail) {
      this.setPlan('pro');
      // Forzar actualización del plan
      this.planSubject.next('pro');
    }
  }

  // Verificar si un usuario tiene plan Pro
  hasProPlan(userEmail: string): boolean {
    const proUsers = JSON.parse(localStorage.getItem('pro_users') || '[]');
    return proUsers.includes(userEmail);
  }

  // Obtener todos los usuarios con plan Pro
  getProUsers(): string[] {
    return JSON.parse(localStorage.getItem('pro_users') || '[]');
  }
}

