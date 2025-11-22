/**
 * Queue Manager for Clinic Queue System
 * Manages ticket queues and clinic operations
 */

class QueueManager {
  constructor() {
    this.clinics = [];
    this.history = [];
    this.maxHistorySize = 100;
  }

  /**
   * Initialize with clinics data
   */
  initialize(clinicsData) {
    this.clinics = clinicsData.map(clinic => ({
      ...clinic,
      queue: clinic.queue || [],
      currentTicket: clinic.currentTicket || 0,
      isActive: clinic.isActive !== undefined ? clinic.isActive : true,
      stats: clinic.stats || {
        totalCalled: 0,
        averageWaitTime: 0,
        lastCallTime: null
      }
    }));
  }

  /**
   * Get clinic by ID
   */
  getClinic(clinicId) {
    return this.clinics.find(c => c.id === clinicId);
  }

  /**
   * Update clinic
   */
  updateClinic(clinicId, updates) {
    const index = this.clinics.findIndex(c => c.id === clinicId);
    if (index !== -1) {
      this.clinics[index] = { ...this.clinics[index], ...updates };
      return this.clinics[index];
    }
    return null;
  }

  /**
   * Call next ticket
   */
  callNext(clinicId) {
    const clinic = this.getClinic(clinicId);
    if (!clinic || !clinic.isActive) {
      return null;
    }

    const nextTicket = clinic.currentTicket + 1;
    
    const callData = {
      clinicId: clinic.id,
      clinicName: clinic.name,
      ticketNumber: nextTicket,
      timestamp: Date.now(),
      type: 'next'
    };

    this.updateClinic(clinicId, {
      currentTicket: nextTicket,
      lastCall: new Date().toISOString()
    });

    this.addToHistory(callData);
    this.updateStats(clinicId);

    return callData;
  }

  /**
   * Call previous ticket
   */
  callPrevious(clinicId) {
    const clinic = this.getClinic(clinicId);
    if (!clinic || !clinic.isActive) {
      return null;
    }

    const prevTicket = Math.max(0, clinic.currentTicket - 1);
    
    const callData = {
      clinicId: clinic.id,
      clinicName: clinic.name,
      ticketNumber: prevTicket,
      timestamp: Date.now(),
      type: 'previous'
    };

    this.updateClinic(clinicId, {
      currentTicket: prevTicket,
      lastCall: new Date().toISOString()
    });

    this.addToHistory(callData);

    return callData;
  }

  /**
   * Repeat current call
   */
  repeatCall(clinicId) {
    const clinic = this.getClinic(clinicId);
    if (!clinic || !clinic.isActive || clinic.currentTicket === 0) {
      return null;
    }

    const callData = {
      clinicId: clinic.id,
      clinicName: clinic.name,
      ticketNumber: clinic.currentTicket,
      timestamp: Date.now(),
      type: 'repeat'
    };

    this.updateClinic(clinicId, {
      lastCall: new Date().toISOString()
    });

    this.addToHistory(callData);

    return callData;
  }

  /**
   * Call specific ticket
   */
  callSpecific(clinicId, ticketNumber) {
    const clinic = this.getClinic(clinicId);
    if (!clinic || !clinic.isActive) {
      return null;
    }

    const callData = {
      clinicId: clinic.id,
      clinicName: clinic.name,
      ticketNumber: ticketNumber,
      timestamp: Date.now(),
      type: 'specific'
    };

    this.updateClinic(clinicId, {
      currentTicket: ticketNumber,
      lastCall: new Date().toISOString()
    });

    this.addToHistory(callData);
    this.updateStats(clinicId);

    return callData;
  }

  /**
   * Reset clinic
   */
  resetClinic(clinicId) {
    const clinic = this.getClinic(clinicId);
    if (!clinic) {
      return null;
    }

    this.updateClinic(clinicId, {
      currentTicket: 0,
      queue: [],
      lastCall: null
    });

    return this.getClinic(clinicId);
  }

  /**
   * Pause clinic
   */
  pauseClinic(clinicId) {
    return this.updateClinic(clinicId, { isActive: false });
  }

  /**
   * Resume clinic
   */
  resumeClinic(clinicId) {
    return this.updateClinic(clinicId, { isActive: true });
  }

  /**
   * Add ticket to queue
   */
  addToQueue(clinicId, ticketNumber) {
    const clinic = this.getClinic(clinicId);
    if (!clinic) {
      return null;
    }

    if (!clinic.queue) {
      clinic.queue = [];
    }

    clinic.queue.push({
      number: ticketNumber,
      timestamp: Date.now(),
      status: 'waiting'
    });

    return this.updateClinic(clinicId, { queue: clinic.queue });
  }

  /**
   * Remove from queue
   */
  removeFromQueue(clinicId, ticketNumber) {
    const clinic = this.getClinic(clinicId);
    if (!clinic || !clinic.queue) {
      return null;
    }

    clinic.queue = clinic.queue.filter(t => t.number !== ticketNumber);
    return this.updateClinic(clinicId, { queue: clinic.queue });
  }

  /**
   * Get queue length
   */
  getQueueLength(clinicId) {
    const clinic = this.getClinic(clinicId);
    return clinic?.queue?.length || 0;
  }

  /**
   * Get estimated wait time
   */
  getEstimatedWaitTime(clinicId, ticketNumber) {
    const clinic = this.getClinic(clinicId);
    if (!clinic) {
      return 0;
    }

    const position = ticketNumber - clinic.currentTicket;
    const avgTime = clinic.stats?.averageWaitTime || 5; // Default 5 minutes

    return position * avgTime;
  }

  /**
   * Add to history
   */
  addToHistory(callData) {
    this.history.unshift(callData);
    
    // Keep only max size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get history
   */
  getHistory(limit = 10) {
    return this.history.slice(0, limit);
  }

  /**
   * Get clinic history
   */
  getClinicHistory(clinicId, limit = 10) {
    return this.history
      .filter(h => h.clinicId === clinicId)
      .slice(0, limit);
  }

  /**
   * Update statistics
   */
  updateStats(clinicId) {
    const clinic = this.getClinic(clinicId);
    if (!clinic) return;

    if (!clinic.stats) {
      clinic.stats = {
        totalCalled: 0,
        averageWaitTime: 5,
        lastCallTime: null
      };
    }

    clinic.stats.totalCalled += 1;
    
    // Calculate average wait time based on last calls
    const recentCalls = this.getClinicHistory(clinicId, 10);
    if (recentCalls.length > 1) {
      const timeDiffs = [];
      for (let i = 0; i < recentCalls.length - 1; i++) {
        const diff = (recentCalls[i].timestamp - recentCalls[i + 1].timestamp) / 1000 / 60;
        timeDiffs.push(diff);
      }
      const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      clinic.stats.averageWaitTime = Math.round(avgDiff * 10) / 10;
    }

    clinic.stats.lastCallTime = Date.now();
    this.updateClinic(clinicId, { stats: clinic.stats });
  }

  /**
   * Get all clinics
   */
  getAllClinics() {
    return this.clinics;
  }

  /**
   * Get active clinics
   */
  getActiveClinics() {
    return this.clinics.filter(c => c.isActive);
  }

  /**
   * Get clinic statistics
   */
  getClinicStats(clinicId) {
    const clinic = this.getClinic(clinicId);
    if (!clinic) return null;

    return {
      currentTicket: clinic.currentTicket,
      totalCalled: clinic.stats?.totalCalled || 0,
      averageWaitTime: clinic.stats?.averageWaitTime || 5,
      queueLength: this.getQueueLength(clinicId),
      isActive: clinic.isActive,
      lastCall: clinic.lastCall
    };
  }

  /**
   * Get overall statistics
   */
  getOverallStats() {
    const totalClinics = this.clinics.length;
    const activeClinics = this.getActiveClinics().length;
    const totalTicketsCalled = this.clinics.reduce((sum, c) => sum + (c.stats?.totalCalled || 0), 0);
    const totalInQueue = this.clinics.reduce((sum, c) => sum + this.getQueueLength(c.id), 0);

    return {
      totalClinics,
      activeClinics,
      totalTicketsCalled,
      totalInQueue,
      recentCalls: this.getHistory(5)
    };
  }

  /**
   * Export data
   */
  exportData() {
    return {
      clinics: this.clinics,
      history: this.history,
      timestamp: Date.now()
    };
  }

  /**
   * Import data
   */
  importData(data) {
    if (data.clinics) {
      this.clinics = data.clinics;
    }
    if (data.history) {
      this.history = data.history;
    }
  }

  /**
   * Clear all data
   */
  clearAll() {
    this.clinics.forEach(clinic => {
      this.resetClinic(clinic.id);
    });
    this.history = [];
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QueueManager;
}

// Make available globally
window.QueueManager = QueueManager;
