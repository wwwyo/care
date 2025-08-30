export class Inquiry {
  private constructor(
    public readonly id: string,
    public readonly planId: string,
    public readonly facilityId: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: { planId: string; facilityId: string }): Inquiry {
    return new Inquiry(
      crypto.randomUUID(),
      params.planId,
      params.facilityId,
      'pending',
      new Date(),
      new Date(),
    )
  }

  static fromPrisma(data: {
    id: string
    planId: string
    facilityId: string
    status: string
    createdAt: Date
    updatedAt: Date
  }): Inquiry {
    return new Inquiry(
      data.id,
      data.planId,
      data.facilityId,
      data.status,
      data.createdAt,
      data.updatedAt,
    )
  }

  updateStatus(status: 'pending' | 'accepted' | 'rejected' | 'closed'): Inquiry {
    return new Inquiry(this.id, this.planId, this.facilityId, status, this.createdAt, new Date())
  }
}
