export type SlotStatus = 'available' | 'limited' | 'unavailable'

export type SlotData = {
  id: string
  facilityId: string
  status: string
  comment: string | null
  updatedAt: Date
  updatedBy: string
}

export class Slot {
  private constructor(
    private readonly id: string,
    private readonly facilityId: string,
    private status: SlotStatus,
    private comment: string | null,
    private readonly updatedAt: Date,
    private readonly updatedBy: string,
  ) {}

  static fromData(data: SlotData): Slot {
    const status = Slot.mapStatus(data.status)
    return new Slot(data.id, data.facilityId, status, data.comment, data.updatedAt, data.updatedBy)
  }

  static create(facilityId: string, status: SlotStatus, updatedBy: string, comment?: string): Slot {
    return new Slot(crypto.randomUUID(), facilityId, status, comment ?? null, new Date(), updatedBy)
  }

  private static mapStatus(status: string): SlotStatus {
    switch (status) {
      case 'available':
      case 'open':
        return 'available'
      case 'limited':
        return 'limited'
      case 'unavailable':
      case 'closed':
        return 'unavailable'
      default:
        return 'unavailable'
    }
  }

  getId(): string {
    return this.id
  }

  getFacilityId(): string {
    return this.facilityId
  }

  getStatus(): SlotStatus {
    return this.status
  }

  getComment(): string | null {
    return this.comment
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  getUpdatedBy(): string {
    return this.updatedBy
  }

  updateStatus(status: SlotStatus, comment?: string): Slot {
    return new Slot(this.id, this.facilityId, status, comment ?? null, new Date(), this.updatedBy)
  }

  isAvailable(): boolean {
    return this.status === 'available'
  }

  isLimited(): boolean {
    return this.status === 'limited'
  }

  isUnavailable(): boolean {
    return this.status === 'unavailable'
  }

  getStatusDisplay(): { emoji: string; label: string; color: string } {
    switch (this.status) {
      case 'available':
        return { emoji: '🟢', label: '空きあり', color: 'green' }
      case 'limited':
        return { emoji: '🟡', label: '要相談', color: 'yellow' }
      case 'unavailable':
        return { emoji: '🔴', label: '空きなし', color: 'red' }
    }
  }

  toUpdateData() {
    return {
      status: this.status,
      comment: this.comment,
    }
  }
}
