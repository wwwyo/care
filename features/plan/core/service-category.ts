export type ServiceCategoryType = 'home' | 'residential' | 'daytime' | 'other' | 'child'

export class ServiceCategory {
  private constructor(readonly value: ServiceCategoryType) {}

  static create(value: string): ServiceCategory | { type: 'ValidationError'; message: string } {
    if (!ServiceCategory.isValidCategory(value)) {
      return {
        type: 'ValidationError',
        message: `Invalid service category: ${value}`,
      }
    }
    return new ServiceCategory(value as ServiceCategoryType)
  }

  private static isValidCategory(value: string): value is ServiceCategoryType {
    return ['home', 'residential', 'daytime', 'other', 'child'].includes(value)
  }

  static fromString(value: string): ServiceCategoryType {
    // 既知の変換マッピング
    const mapping: Record<string, ServiceCategoryType> = {
      day: 'daytime',
      shortStay: 'residential',
      homeHelp: 'home',
      other: 'other',
      // 新しいマッピングも追加
      home: 'home',
      residential: 'residential',
      daytime: 'daytime',
      child: 'child',
    }

    return mapping[value] || 'other'
  }
}
