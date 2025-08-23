type PlanStatus = 'draft' | 'published'
type VersionType = 'draft' | 'published'
type ServiceCategory = 'home' | 'residential' | 'daytime' | 'other' | 'child'

export type PlanError =
  | { type: 'ValidationError'; message: string }
  | { type: 'NotFound'; message: string }

export class Plan {
  readonly id: string
  readonly tenantId: string
  readonly clientId: string
  readonly currentVersionId: string | null
  readonly status: PlanStatus
  readonly versions: PlanVersion[]
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: {
    id: string
    tenantId: string
    clientId: string
    currentVersionId: string | null
    status: PlanStatus
    versions: PlanVersion[]
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.tenantId = props.tenantId
    this.clientId = props.clientId
    this.currentVersionId = props.currentVersionId
    this.status = props.status
    this.versions = props.versions
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: { tenantId: string; clientId: string }): Plan {
    return new Plan({
      id: crypto.randomUUID(),
      tenantId: props.tenantId,
      clientId: props.clientId,
      currentVersionId: null,
      status: 'draft',
      versions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  addVersion(version: PlanVersion): Plan | PlanError {
    // バージョン番号の連続性チェック
    const expectedVersionNumber = this.versions.length + 1
    if (version.versionNumber !== expectedVersionNumber) {
      return {
        type: 'ValidationError',
        message: 'Version number must be sequential',
      }
    }

    return new Plan({
      ...this,
      versions: [...this.versions, version],
      currentVersionId: version.id,
      updatedAt: new Date(),
    })
  }

  createNewVersion(props: {
    createdBy: string
    desiredLife?: string
    troubles?: string
    considerations?: string
    reasonForUpdate?: string
  }): Plan | PlanError {
    const nextVersionNumber = this.versions.length + 1

    const newVersion = PlanVersion.create({
      planId: this.id,
      versionNumber: nextVersionNumber,
      createdBy: props.createdBy,
      desiredLife: props.desiredLife,
      troubles: props.troubles,
      considerations: props.considerations,
      reasonForUpdate: props.reasonForUpdate,
    })

    return new Plan({
      ...this,
      versions: [...this.versions, newVersion],
      currentVersionId: newVersion.id,
      updatedAt: new Date(),
    })
  }

  publish(versionId: string): Plan | PlanError {
    const version = this.versions.find((v) => v.id === versionId)
    if (!version) {
      return {
        type: 'NotFound',
        message: 'Version not found',
      }
    }

    const publishResult = version.publish()
    if ('type' in publishResult) {
      return publishResult
    }

    const updatedVersions = this.versions.map((v) => (v.id === versionId ? publishResult : v))

    return new Plan({
      ...this,
      status: 'published',
      versions: updatedVersions,
      updatedAt: new Date(),
    })
  }

  static fromPersistence(props: {
    id: string
    tenantId: string
    clientId: string
    currentVersionId: string | null
    status: PlanStatus
    versions: PlanVersion[]
    createdAt: Date
    updatedAt: Date
  }): Plan {
    return new Plan(props)
  }
}

export class PlanVersion {
  readonly id: string
  readonly planId: string
  readonly versionNumber: number
  readonly versionType: VersionType
  readonly desiredLife: string | null
  readonly troubles: string | null
  readonly considerations: string | null
  readonly services: PlanService[]
  readonly createdBy: string
  readonly reasonForUpdate: string | null
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: {
    id: string
    planId: string
    versionNumber: number
    versionType: VersionType
    desiredLife: string | null
    troubles: string | null
    considerations: string | null
    services: PlanService[]
    createdBy: string
    reasonForUpdate: string | null
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.planId = props.planId
    this.versionNumber = props.versionNumber
    this.versionType = props.versionType
    this.desiredLife = props.desiredLife
    this.troubles = props.troubles
    this.considerations = props.considerations
    this.services = props.services
    this.createdBy = props.createdBy
    this.reasonForUpdate = props.reasonForUpdate
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: {
    planId: string
    versionNumber: number
    createdBy: string
    desiredLife?: string
    troubles?: string
    considerations?: string
    reasonForUpdate?: string
  }): PlanVersion {
    return new PlanVersion({
      id: crypto.randomUUID(),
      planId: props.planId,
      versionNumber: props.versionNumber,
      versionType: 'draft',
      desiredLife: props.desiredLife ?? null,
      troubles: props.troubles ?? null,
      considerations: props.considerations ?? null,
      services: [],
      createdBy: props.createdBy,
      reasonForUpdate: props.reasonForUpdate ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  canUpdate(): boolean {
    return this.versionType !== 'published'
  }

  update(props: {
    desiredLife?: string
    troubles?: string
    considerations?: string
  }): PlanVersion | PlanError {
    // 確定版は更新できない
    if (!this.canUpdate()) {
      return {
        type: 'ValidationError',
        message: 'Cannot update published version',
      }
    }

    return new PlanVersion({
      ...this,
      desiredLife: props.desiredLife ?? this.desiredLife,
      troubles: props.troubles ?? this.troubles,
      considerations: props.considerations ?? this.considerations,
      updatedAt: new Date(),
    })
  }

  addService(service: PlanService): PlanVersion | PlanError {
    // 確定版は更新できない
    if (!this.canUpdate()) {
      return {
        type: 'ValidationError',
        message: 'Cannot update published version',
      }
    }

    return new PlanVersion({
      ...this,
      services: [...this.services, service],
      updatedAt: new Date(),
    })
  }

  removeService(serviceId: string): PlanVersion | PlanError {
    // 確定版は更新できない
    if (!this.canUpdate()) {
      return {
        type: 'ValidationError',
        message: 'Cannot update published version',
      }
    }

    return new PlanVersion({
      ...this,
      services: this.services.filter((s) => s.id !== serviceId),
      updatedAt: new Date(),
    })
  }

  publish(): PlanVersion | PlanError {
    if (!this.canUpdate()) {
      return {
        type: 'ValidationError',
        message: 'Version is already published',
      }
    }

    return new PlanVersion({
      ...this,
      versionType: 'published',
      updatedAt: new Date(),
    })
  }

  static fromPersistence(props: {
    id: string
    planId: string
    versionNumber: number
    versionType: VersionType
    desiredLife: string | null
    troubles: string | null
    considerations: string | null
    services: PlanService[]
    createdBy: string
    reasonForUpdate: string | null
    createdAt: Date
    updatedAt: Date
  }): PlanVersion {
    return new PlanVersion(props)
  }
}

export class PlanService {
  readonly id: string
  readonly planVersionId: string
  readonly serviceCategory: ServiceCategory
  readonly serviceType: string
  readonly desiredAmount: string | null
  readonly desiredLifeByService: string | null
  readonly achievementPeriod: string | null
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: {
    id: string
    planVersionId: string
    serviceCategory: ServiceCategory
    serviceType: string
    desiredAmount: string | null
    desiredLifeByService: string | null
    achievementPeriod: string | null
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.planVersionId = props.planVersionId
    this.serviceCategory = props.serviceCategory
    this.serviceType = props.serviceType
    this.desiredAmount = props.desiredAmount
    this.desiredLifeByService = props.desiredLifeByService
    this.achievementPeriod = props.achievementPeriod
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: {
    planVersionId: string
    serviceCategory: ServiceCategory
    serviceType: string
    desiredAmount?: string
    desiredLifeByService?: string
    achievementPeriod?: string
  }): PlanService {
    return new PlanService({
      id: crypto.randomUUID(),
      planVersionId: props.planVersionId,
      serviceCategory: props.serviceCategory,
      serviceType: props.serviceType,
      desiredAmount: props.desiredAmount ?? null,
      desiredLifeByService: props.desiredLifeByService ?? null,
      achievementPeriod: props.achievementPeriod ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  update(props: {
    desiredAmount?: string
    desiredLifeByService?: string
    achievementPeriod?: string
  }): PlanService {
    return new PlanService({
      ...this,
      desiredAmount: props.desiredAmount ?? this.desiredAmount,
      desiredLifeByService: props.desiredLifeByService ?? this.desiredLifeByService,
      achievementPeriod: props.achievementPeriod ?? this.achievementPeriod,
      updatedAt: new Date(),
    })
  }

  static fromPersistence(props: {
    id: string
    planVersionId: string
    serviceCategory: ServiceCategory
    serviceType: string
    desiredAmount: string | null
    desiredLifeByService: string | null
    achievementPeriod: string | null
    createdAt: Date
    updatedAt: Date
  }): PlanService {
    return new PlanService(props)
  }
}
