/**
 * Shared Audio Context for Notifications
 * Handles browser security restrictions by initializing AudioContext on user interaction
 */

class NotificationAudio {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  /**
   * Initialize AudioContext (should be called on user interaction)
   */
  public initialize(): void {
    if (typeof window === 'undefined') return;
    if (this.isInitialized && this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log('[Audio] AudioContext initialized successfully');
    } catch (error) {
      console.warn('[Audio] Failed to initialize AudioContext:', error);
    }
  }

  /**
   * Resume AudioContext if suspended (e.g., after page becomes inactive)
   */
  private async resumeContext(): Promise<void> {
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('[Audio] AudioContext resumed');
      } catch (error) {
        console.warn('[Audio] Failed to resume AudioContext:', error);
      }
    }
  }

  /**
   * Play notification sound
   * Uses a pleasant two-tone notification sound
   */
  public async playNotificationSound(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Initialize context if not already done
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.audioContext) {
      console.warn('[Audio] AudioContext not available');
      return;
    }

    try {
      // Resume context if needed
      await this.resumeContext();

      const currentTime = this.audioContext.currentTime;

      // First tone (A5 - 880 Hz)
      const oscillator1 = this.audioContext.createOscillator();
      const gainNode1 = this.audioContext.createGain();

      oscillator1.connect(gainNode1);
      gainNode1.connect(this.audioContext.destination);

      oscillator1.frequency.setValueAtTime(880, currentTime);
      oscillator1.type = 'sine';

      gainNode1.gain.setValueAtTime(0, currentTime);
      gainNode1.gain.linearRampToValueAtTime(0.3, currentTime + 0.1);
      gainNode1.gain.linearRampToValueAtTime(0, currentTime + 0.4);

      oscillator1.start(currentTime);
      oscillator1.stop(currentTime + 0.4);

      // Second tone (D6 - 1174.66 Hz) - slightly delayed for pleasant effect
      setTimeout(() => {
        if (!this.audioContext) return;

        const currentTime2 = this.audioContext.currentTime;
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);

        oscillator2.frequency.setValueAtTime(1174.66, currentTime2);
        oscillator2.type = 'sine';

        gainNode2.gain.setValueAtTime(0, currentTime2);
        gainNode2.gain.linearRampToValueAtTime(0.3, currentTime2 + 0.1);
        gainNode2.gain.linearRampToValueAtTime(0, currentTime2 + 0.3);

        oscillator2.start(currentTime2);
        oscillator2.stop(currentTime2 + 0.3);
      }, 150);
    } catch (error) {
      console.warn('[Audio] Error playing notification sound:', error);
    }
  }

  /**
   * Get the current AudioContext state
   */
  public getState(): AudioContextState | null {
    return this.audioContext?.state || null;
  }
}

// Singleton instance
const notificationAudio = new NotificationAudio();

// Auto-initialize on any user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    notificationAudio.initialize();
    // Remove listeners after first interaction
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
  };

  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('keydown', initOnInteraction, { once: true });
  document.addEventListener('touchstart', initOnInteraction, { once: true });
}

export default notificationAudio;
