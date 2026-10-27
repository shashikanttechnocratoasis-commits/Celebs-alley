import { StateCreator } from "zustand";
import initialConsultants from "@/data/consultants.json";
import initialAvailability from "@/data/availability.json";
import initialClientNotes from "@/data/clientNotes.json";
import initialScanShareConsents from "@/data/scanShareConsents.json";
import initialConsultantReviews from "@/data/consultantReviews.json";
import initialSessions from "@/data/sessions.json";
import type {
  ConsultantProfile,
  AvailabilityRule,
  TimeOff,
  ClientNote,
  ScanShareConsent,
  ConsultantReview,
  SessionRecord,
  Appointment,
} from "@/types";
import { sendNotification } from "@/lib/notify";

export interface ConsultantSlice {
  consultants: ConsultantProfile[];
  availabilityRules: AvailabilityRule[];
  timeOffs: TimeOff[];
  clientNotes: ClientNote[];
  scanShareConsents: ScanShareConsent[];
  consultantReviews: ConsultantReview[];
  sessions: SessionRecord[];

  // Profile & Suspension
  updateConsultantProfile: (id: string, updates: Partial<ConsultantProfile>) => void;
  toggleConsultantSuspension: (id: string) => { status: "active" | "suspended" };

  // Availability Management
  updateAvailabilityRule: (id: string, updates: Partial<AvailabilityRule>) => void;
  addTimeOff: (timeOff: Omit<TimeOff, "id">) => void;
  deleteTimeOff: (id: string) => void;

  // Appointment State Machine
  acceptAppointment: (appointmentId: string) => { success: boolean };
  declineAppointment: (appointmentId: string, reason: string) => { success: boolean };
  proposeNewAppointmentTime: (
    appointmentId: string,
    proposedDate: string,
    proposedTime: string
  ) => { success: boolean };
  customerAcceptProposedTime: (appointmentId: string) => { success: boolean };
  completeAppointment: (appointmentId: string) => { success: boolean };
  markNoShowAppointment: (appointmentId: string) => { success: boolean };
  cancelAppointmentWithReason: (
    appointmentId: string,
    reason: string,
    actor?: string
  ) => { success: boolean };

  // Clinical Notes (SOAP)
  saveClientNote: (
    note: Omit<ClientNote, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => ClientNote;

  // Scan Share Consent
  grantScanShareConsent: (customerId: string, consultantId: string) => void;
  revokeScanShareConsent: (customerId: string, consultantId: string) => void;
  requestScanShareConsent: (customerId: string, consultantId: string) => void;

  // Reviews
  addConsultantReview: (
    review: Omit<ConsultantReview, "id" | "createdAt">
  ) => ConsultantReview;

  // Sessions
  startVideoSession: (appointmentId: string) => SessionRecord;
  endVideoSession: (
    appointmentId: string,
    durationMinutes: number,
    notesSummary?: string
  ) => SessionRecord;
}

export const createConsultantSlice: StateCreator<
  any,
  [],
  [],
  ConsultantSlice
> = (set, get) => ({
  consultants: (initialConsultants as any[]).map((c) => ({
    ...c,
    status: c.status || "active",
    modeAvailability: c.modeAvailability || ["video", "in-clinic"],
  })) as ConsultantProfile[],
  availabilityRules: initialAvailability as AvailabilityRule[],
  timeOffs: [],
  clientNotes: initialClientNotes as ClientNote[],
  scanShareConsents: initialScanShareConsents as ScanShareConsent[],
  consultantReviews: initialConsultantReviews as ConsultantReview[],
  sessions: initialSessions as SessionRecord[],

  updateConsultantProfile: (id, updates) => {
    set((state: any) => ({
      consultants: state.consultants.map((c: ConsultantProfile) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));

    // Log audit
    if (get().addAuditLog) {
      get().addAuditLog({
        action: "CONSULTANT_PROFILE_UPDATED",
        actor: get().currentUser?.name || "Consultant",
        target: id,
        details: `Consultant profile ${id} updated: ${Object.keys(updates).join(", ")}`,
        status: "success",
      });
    }
  },

  toggleConsultantSuspension: (id) => {
    let newStatus: "active" | "suspended" = "suspended";
    set((state: any) => {
      const updated = state.consultants.map((c: ConsultantProfile) => {
        if (c.id === id) {
          newStatus = c.status === "suspended" ? "active" : "suspended";
          return { ...c, status: newStatus };
        }
        return c;
      });
      return { consultants: updated };
    });

    // Notify consultant and audit
    sendNotification({
      type: newStatus === "suspended" ? "error" : "success",
      recipientId: id,
      recipientRole: "Consultant",
      title: `Consultant Account ${newStatus === "suspended" ? "Suspended" : "Reactivated"}`,
      body: `Your consultant clinical privileges have been ${newStatus} by platform administrative governance.`,
      link: "/consultant",
      priority: "high",
    });

    if (get().addAuditLog) {
      get().addAuditLog({
        action: newStatus === "suspended" ? "CONSULTANT_SUSPENDED" : "CONSULTANT_REINSTATED",
        actor: get().currentUser?.name || "Admin",
        target: id,
        details: `Consultant ${id} status toggled to ${newStatus}`,
        status: "success",
      });
    }

    return { status: newStatus };
  },

  updateAvailabilityRule: (id, updates) => {
    set((state: any) => ({
      availabilityRules: state.availabilityRules.map((rule: AvailabilityRule) =>
        rule.id === id ? { ...rule, ...updates } : rule
      ),
    }));
  },

  addTimeOff: (timeOff) => {
    const newRecord: TimeOff = {
      ...timeOff,
      id: `timeoff-${Date.now()}`,
    };
    set((state: any) => ({
      timeOffs: [...state.timeOffs, newRecord],
    }));
  },

  deleteTimeOff: (id) => {
    set((state: any) => ({
      timeOffs: state.timeOffs.filter((t: TimeOff) => t.id !== id),
    }));
  },

  acceptAppointment: (appointmentId) => {
    let targetApt: Appointment | undefined;
    set((state: any) => {
      const updated = state.appointments.map((a: Appointment) => {
        if (a.id === appointmentId) {
          targetApt = {
            ...a,
            status: "confirmed",
            activityLog: [
              ...(a.activityLog || []),
              {
                timestamp: new Date().toISOString(),
                action: "Accepted by consultant",
                actor: state.currentUser?.name || "Consultant",
              },
            ],
          };
          return targetApt;
        }
        return a;
      });
      return { appointments: updated };
    });

    if (targetApt) {
      sendNotification({
        type: "appointment",
        recipientId: targetApt.customerId,
        recipientRole: "Customer",
        title: "Consultation Booking Confirmed",
        body: `${targetApt.consultantName} accepted your appointment for ${targetApt.date} at ${targetApt.time}.`,
        link: "/app/consultations",
        priority: "high",
        showToast: true,
      });

      if (get().logActivityEvent) {
        get().logActivityEvent({
          entityType: "appointment",
          entityId: appointmentId,
          action: "APPOINTMENT_CONFIRMED",
          actorId: targetApt.consultantId,
          actorName: targetApt.consultantName,
          actorRole: "Consultant",
          metadata: { date: targetApt.date, time: targetApt.time },
        });
      }

      if (get().addAuditLog) {
        get().addAuditLog({
          action: "APPOINTMENT_ACCEPTED",
          actor: targetApt.consultantName,
          target: appointmentId,
          details: `Consultation confirmed for customer ${targetApt.customerName} on ${targetApt.date}`,
          status: "success",
        });
      }
    }

    return { success: true };
  },

  declineAppointment: (appointmentId, reason) => {
    let targetApt: Appointment | undefined;
    set((state: any) => {
      const updated = state.appointments.map((a: Appointment) => {
        if (a.id === appointmentId) {
          targetApt = {
            ...a,
            status: "cancelled",
            declineReason: reason,
            activityLog: [
              ...(a.activityLog || []),
              {
                timestamp: new Date().toISOString(),
                action: `Declined by consultant: ${reason}`,
                actor: state.currentUser?.name || "Consultant",
                note: reason,
              },
            ],
          };
          return targetApt;
        }
        return a;
      });
      return { appointments: updated };
    });

    if (targetApt) {
      sendNotification({
        type: "appointment",
        recipientId: targetApt.customerId,
        recipientRole: "Customer",
        title: "Consultation Request Declined",
        body: `${targetApt.consultantName} could not accommodate the requested time: "${reason}". Please pick an alternative slot.`,
        link: "/app/consultations",
        priority: "high",
      });

      if (get().addAuditLog) {
        get().addAuditLog({
          action: "APPOINTMENT_DECLINED",
          actor: targetApt.consultantName,
          target: appointmentId,
          details: `Consultant declined booking with reason: ${reason}`,
          status: "warning",
        });
      }
    }

    return { success: true };
  },

  proposeNewAppointmentTime: (appointmentId, proposedDate, proposedTime) => {
    let targetApt: Appointment | undefined;
    set((state: any) => {
      const updated = state.appointments.map((a: Appointment) => {
        if (a.id === appointmentId) {
          targetApt = {
            ...a,
            status: "rescheduled",
            proposedDate,
            proposedTime,
            activityLog: [
              ...(a.activityLog || []),
              {
                timestamp: new Date().toISOString(),
                action: `Consultant proposed new time: ${proposedDate} at ${proposedTime}`,
                actor: state.currentUser?.name || "Consultant",
              },
            ],
          };
          return targetApt;
        }
        return a;
      });
      return { appointments: updated };
    });

    if (targetApt) {
      sendNotification({
        type: "appointment",
        recipientId: targetApt.customerId,
        recipientRole: "Customer",
        title: "Reschedule Proposed by Consultant",
        body: `${targetApt.consultantName} proposed a new appointment slot for ${proposedDate} at ${proposedTime}. Tap to review and accept.`,
        link: "/app/consultations",
        priority: "high",
        showToast: true,
      });

      if (get().addAuditLog) {
        get().addAuditLog({
          action: "APPOINTMENT_RESCHEDULE_PROPOSED",
          actor: targetApt.consultantName,
          target: appointmentId,
          details: `Consultant proposed ${proposedDate} ${proposedTime}`,
          status: "success",
        });
      }
    }

    return { success: true };
  },

  customerAcceptProposedTime: (appointmentId) => {
    let targetApt: Appointment | undefined;
    set((state: any) => {
      const updated = state.appointments.map((a: Appointment) => {
        if (a.id === appointmentId) {
          const finalDate = a.proposedDate || a.date;
          const finalTime = a.proposedTime || a.time;
          targetApt = {
            ...a,
            date: finalDate,
            time: finalTime,
            status: "confirmed",
            proposedDate: undefined,
            proposedTime: undefined,
            activityLog: [
              ...(a.activityLog || []),
              {
                timestamp: new Date().toISOString(),
                action: `Customer accepted proposed time: ${finalDate} at ${finalTime}`,
                actor: a.customerName,
              },
            ],
          };
          return targetApt;
        }
        return a;
      });
      return { appointments: updated };
    });

    if (targetApt) {
      sendNotification({
        type: "appointment",
        recipientId: targetApt.consultantId,
        recipientRole: "Consultant",
        title: "Client Accepted Reschedule Time",
        body: `${targetApt.customerName} accepted the proposed consultation time: ${targetApt.date} at ${targetApt.time}.`,
        link: "/consultant/appointments",
        priority: "high",
      });
    }

    return { success: true };
  },

  completeAppointment: (appointmentId) => {
    let targetApt: Appointment | undefined;
    set((state: any) => {
      const updated = state.appointments.map((a: Appointment) => {
        if (a.id === appointmentId) {
          targetApt = {
            ...a,
            status: "completed",
            activityLog: [
              ...(a.activityLog || []),
              {
                timestamp: new Date().toISOString(),
                action: "Session marked completed",
                actor: state.currentUser?.name || "Consultant",
              },
            ],
          };
          return targetApt;
        }
        return a;
      });
      return { appointments: updated };
    });

    if (targetApt) {
      sendNotification({
        type: "appointment",
        recipientId: targetApt.customerId,
        recipientRole: "Customer",
        title: "Consultation Complete",
        body: `Your telehealth appointment with ${targetApt.consultantName} has concluded. Please rate your clinical experience!`,
        link: "/app/consultations",
        priority: "medium",
      });

      if (get().addAuditLog) {
        get().addAuditLog({
          action: "APPOINTMENT_COMPLETED",
          actor: targetApt.consultantName,
          target: appointmentId,
          details: `Completed session with ${targetApt.customerName}`,
          status: "success",
        });
      }
    }

    return { success: true };
  },

  markNoShowAppointment: (appointmentId) => {
    let targetApt: Appointment | undefined;
    set((state: any) => {
      const updated = state.appointments.map((a: Appointment) => {
        if (a.id === appointmentId) {
          targetApt = {
            ...a,
            status: "no_show",
            activityLog: [
              ...(a.activityLog || []),
              {
                timestamp: new Date().toISOString(),
                action: "Marked client no-show",
                actor: state.currentUser?.name || "Consultant",
              },
            ],
          };
          return targetApt;
        }
        return a;
      });
      return { appointments: updated };
    });

    if (targetApt) {
      sendNotification({
        type: "appointment",
        recipientId: targetApt.customerId,
        recipientRole: "Customer",
        title: "Consultation Marked No-Show",
        body: `You missed your scheduled telehealth consultation with ${targetApt.consultantName}. Please reschedule at your convenience.`,
        link: "/app/consultations",
        priority: "high",
      });
    }

    return { success: true };
  },

  cancelAppointmentWithReason: (appointmentId, reason, actor = "Consultant") => {
    let targetApt: Appointment | undefined;
    set((state: any) => {
      const updated = state.appointments.map((a: Appointment) => {
        if (a.id === appointmentId) {
          targetApt = {
            ...a,
            status: "cancelled",
            cancelReason: reason,
            activityLog: [
              ...(a.activityLog || []),
              {
                timestamp: new Date().toISOString(),
                action: `Cancelled: ${reason}`,
                actor,
              },
            ],
          };
          return targetApt;
        }
        return a;
      });
      return { appointments: updated };
    });

    if (targetApt) {
      sendNotification({
        type: "appointment",
        recipientId: actor === "Consultant" ? targetApt.customerId : targetApt.consultantId,
        recipientRole: actor === "Consultant" ? "Customer" : "Consultant",
        title: "Consultation Appointment Cancelled",
        body: `Appointment on ${targetApt.date} at ${targetApt.time} was cancelled by ${actor}: "${reason}".`,
        link: actor === "Consultant" ? "/app/consultations" : "/consultant/appointments",
        priority: "high",
      });
    }

    return { success: true };
  },

  saveClientNote: (noteData) => {
    const existingIndex = get().clientNotes.findIndex(
      (n: ClientNote) =>
        (noteData.id && n.id === noteData.id) ||
        (n.consultantId === noteData.consultantId && n.customerId === noteData.customerId)
    );

    let savedNote: ClientNote;
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = get().clientNotes[existingIndex];
      savedNote = {
        ...existing,
        soap: noteData.soap,
        disclaimer: noteData.disclaimer || existing.disclaimer,
        updatedAt: now,
        history: [
          ...(existing.history || []),
          { timestamp: now, soap: noteData.soap },
        ],
      };
      set((state: any) => {
        const updated = [...state.clientNotes];
        updated[existingIndex] = savedNote;
        return { clientNotes: updated };
      });
    } else {
      savedNote = {
        id: noteData.id || `note-${Date.now()}`,
        consultantId: noteData.consultantId,
        customerId: noteData.customerId,
        appointmentId: noteData.appointmentId,
        soap: noteData.soap,
        disclaimer:
          noteData.disclaimer ||
          "Cosmetic wellness guidance, not a medical diagnosis.",
        createdAt: now,
        updatedAt: now,
        history: [{ timestamp: now, soap: noteData.soap }],
      };
      set((state: any) => ({
        clientNotes: [savedNote, ...state.clientNotes],
      }));
    }

    if (get().addAuditLog) {
      get().addAuditLog({
        action: "CLIENT_CLINICAL_NOTE_SAVED",
        actor: get().currentUser?.name || "Consultant",
        target: noteData.customerId,
        details: `Saved private clinical SOAP note for client ${noteData.customerId}`,
        status: "success",
      });
    }

    return savedNote;
  },

  grantScanShareConsent: (customerId, consultantId) => {
    const now = new Date().toISOString();
    set((state: any) => {
      const existing = state.scanShareConsents.filter(
        (c: ScanShareConsent) =>
          !(c.customerId === customerId && c.consultantId === consultantId)
      );
      return {
        scanShareConsents: [
          ...existing,
          {
            id: `consent-${customerId}-${consultantId}`,
            customerId,
            consultantId,
            granted: true,
            timestamp: now,
            revocable: true,
          },
        ],
      };
    });

    sendNotification({
      type: "scan",
      recipientId: consultantId,
      recipientRole: "Consultant",
      title: "Client Granted Scan Access",
      body: `Customer ${customerId} has authorized you to review their 8-parameter AI biometric facial scans.`,
      link: `/consultant/clients?client=${customerId}`,
      priority: "medium",
    });

    if (get().addAuditLog) {
      get().addAuditLog({
        action: "CONSENT_SCAN_SHARED",
        actor: customerId,
        target: consultantId,
        details: `Customer granted scan access consent to consultant ${consultantId}`,
        status: "success",
      });
    }
  },

  revokeScanShareConsent: (customerId, consultantId) => {
    set((state: any) => {
      const updated = state.scanShareConsents.map((c: ScanShareConsent) =>
        c.customerId === customerId && c.consultantId === consultantId
          ? { ...c, granted: false, timestamp: new Date().toISOString() }
          : c
      );
      return { scanShareConsents: updated };
    });

    if (get().addAuditLog) {
      get().addAuditLog({
        action: "CONSENT_SCAN_REVOKED",
        actor: customerId,
        target: consultantId,
        details: `Customer revoked scan access consent from consultant ${consultantId}`,
        status: "warning",
      });
    }
  },

  requestScanShareConsent: (customerId, consultantId) => {
    sendNotification({
      type: "scan",
      recipientId: customerId,
      recipientRole: "Customer",
      title: "Doctor Requested Scan Access",
      body: `Your consultant would like permission to view your 8-parameter AI face scans to personalize your clinical protocol.`,
      link: "/app/privacy",
      priority: "high",
      showToast: true,
    });
  },

  addConsultantReview: (reviewData) => {
    const newReview: ConsultantReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set((state: any) => {
      const updatedReviews = [newReview, ...state.consultantReviews];
      // Recalculate consultant average rating
      const consReviews = updatedReviews.filter(
        (r) => r.consultantId === reviewData.consultantId
      );
      const avg =
        consReviews.reduce((sum, r) => sum + r.rating, 0) / consReviews.length;

      const updatedConsultants = state.consultants.map((c: ConsultantProfile) =>
        c.id === reviewData.consultantId
          ? {
              ...c,
              rating: Number(avg.toFixed(2)),
              reviewsCount: consReviews.length,
            }
          : c
      );

      return {
        consultantReviews: updatedReviews,
        consultants: updatedConsultants,
      };
    });

    sendNotification({
      type: "info",
      recipientId: reviewData.consultantId,
      recipientRole: "Consultant",
      title: "New Client Consultation Review",
      body: `${reviewData.customerName} left a ${reviewData.rating}-star review: "${reviewData.review}"`,
      link: "/consultant/profile",
      priority: "medium",
    });

    return newReview;
  },

  startVideoSession: (appointmentId) => {
    const apt = get().appointments.find((a: Appointment) => a.id === appointmentId);
    const existing = get().sessions.find(
      (s: SessionRecord) => s.appointmentId === appointmentId
    );

    const now = new Date().toISOString();
    if (existing) {
      const updated: SessionRecord = {
        ...existing,
        actualStart: existing.actualStart || now,
        status: "in_progress",
      };
      set((state: any) => ({
        sessions: state.sessions.map((s: SessionRecord) =>
          s.id === existing.id ? updated : s
        ),
      }));
      return updated;
    }

    const newSession: SessionRecord = {
      id: `sess-${Date.now()}`,
      appointmentId,
      consultantId: apt?.consultantId || "cons-1",
      customerId: apt?.customerId || "cust-1",
      scheduledStart: apt ? `${apt.date}T${apt.time}` : now,
      actualStart: now,
      status: "in_progress",
    };

    set((state: any) => ({
      sessions: [newSession, ...state.sessions],
    }));

    return newSession;
  },

  endVideoSession: (appointmentId, durationMinutes, notesSummary) => {
    const now = new Date().toISOString();
    let updatedSession: SessionRecord | undefined;

    set((state: any) => {
      const updated = state.sessions.map((s: SessionRecord) => {
        if (s.appointmentId === appointmentId) {
          updatedSession = {
            ...s,
            actualEnd: now,
            durationMinutes: durationMinutes || s.durationMinutes || 25,
            notesSummary: notesSummary || s.notesSummary,
            status: "completed",
          };
          return updatedSession;
        }
        return s;
      });
      return { sessions: updated };
    });

    // Auto mark appointment completed
    get().completeAppointment(appointmentId);

    return (
      updatedSession || {
        id: `sess-${Date.now()}`,
        appointmentId,
        consultantId: "cons-1",
        customerId: "cust-1",
        scheduledStart: now,
        actualEnd: now,
        durationMinutes,
        notesSummary,
        status: "completed",
      }
    );
  },
});
