import { VariableType } from '@/types/product'
import { ModelGenerationRuleModel } from '@/lib/models/ModelGenerationRule'
import { VariableConfigModel } from '@/lib/models/VariableConfig'

const DEFAULT_VALUES: Record<VariableType, string> = {
  colorTemperature: '3000K',
  beamAngle: '24°',
  appearanceColor: '白色',
  controlMethod: 'ON/OFF',
}

const COLOR_MAP: Record<string, string> = {
  '白色': 'W', '黑色': 'B', '银色': 'S', '金色': 'G',
  '白色边框/银色反射器': 'WS', '黑色边框/银色反射器': 'BS',
  '白色边框/金色反射器': 'WG', '黑色边框/金色反射器': 'BG',
}

const CONTROL_MAP: Record<string, string> = {
  'ON/OFF': 'O', 'Onoff': 'O', '0-10V': 'V', 'DALI': 'D',
  'BLE': 'B', '调光': 'DIM', 'PWM': 'P',
}

export class ProductModelGenerator {
  static async generateModel(
    baseModel: string,
    variables: Partial<Record<VariableType, string>>,
    ruleId?: string
  ): Promise<string> {
    try {
      const rule = ruleId
        ? await ModelGenerationRuleModel.findAll().then(rules => rules.find(r => (r._id as any)?.toString() === ruleId))
        : await ModelGenerationRuleModel.findDefault()

      if (!rule) {
        return this.generateSimpleModel(baseModel, variables)
      }

      return this.generateModelWithRule(baseModel, variables, rule)
    } catch {
      return this.generateSimpleModel(baseModel, variables)
    }
  }

  private static async generateModelWithRule(
    baseModel: string,
    variables: Partial<Record<VariableType, string>>,
    rule: any
  ): Promise<string> {
    let model = rule.template.replace('{baseModel}', baseModel)
    const defaults = await this.getDefaultValues()
    const complete = {
      colorTemperature: variables.colorTemperature || defaults.colorTemperature,
      beamAngle: variables.beamAngle || defaults.beamAngle,
      appearanceColor: variables.appearanceColor || defaults.appearanceColor,
      controlMethod: variables.controlMethod || defaults.controlMethod,
    }

    for (const [type, value] of Object.entries(complete)) {
      const mapping = rule.variableMapping?.[type as VariableType]
      const code = mapping
        ? this.extractCode(value, mapping)
        : this.extractSimpleCode(type as VariableType, value)
      model = model.replace(`{${type}}`, code)
    }

    return model.replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  private static extractCode(value: string, mapping: any): string {
    try {
      const regex = new RegExp(mapping.extractPattern)
      const match = value.match(regex)
      let code = match?.[1] || value
      if (mapping.codeLength && mapping.padChar) {
        code = code.length > mapping.codeLength
          ? code.substring(0, mapping.codeLength)
          : code.padStart(mapping.codeLength, mapping.padChar)
      }
      return code
    } catch {
      return value
    }
  }

  private static async getDefaultValues(): Promise<Record<VariableType, string>> {
    try {
      const configs = await VariableConfigModel.findAll()
      const defaults = { ...DEFAULT_VALUES }
      for (const config of configs) {
        const def = config.options.find(o => o.isDefault)
        if (def) defaults[config.type] = def.value
      }
      return defaults
    } catch {
      return DEFAULT_VALUES
    }
  }

  private static extractSimpleCode(type: VariableType, value: string): string {
    switch (type) {
      case 'colorTemperature': {
        const m = value.match(/(\d+)K?/)
        return m ? m[1].substring(0, 2) : value
      }
      case 'beamAngle': {
        const m = value.match(/(\d+)°?/)
        return m ? m[1].padStart(2, '0') : value
      }
      case 'appearanceColor':
        return COLOR_MAP[value] || 'W'
      case 'controlMethod':
        return CONTROL_MAP[value] || 'O'
      default:
        return value
    }
  }

  private static generateSimpleModel(
    baseModel: string,
    variables: Partial<Record<VariableType, string>>
  ): string {
    const defaults = DEFAULT_VALUES
    const ct = variables.colorTemperature || defaults.colorTemperature
    const ba = variables.beamAngle || defaults.beamAngle
    const ac = variables.appearanceColor || defaults.appearanceColor
    const cm = variables.controlMethod || defaults.controlMethod

    return [
      baseModel,
      this.extractSimpleCode('colorTemperature', ct) + this.extractSimpleCode('beamAngle', ba),
      this.extractSimpleCode('appearanceColor', ac),
      this.extractSimpleCode('controlMethod', cm),
    ].join('-')
  }

  static validateGeneratedModel(model: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!model?.trim()) errors.push('型号不能为空')
    if (model.includes('ERROR-')) errors.push('型号生成过程中出现错误')
    if (!/^[A-Za-z0-9\-_]+$/.test(model)) errors.push('型号包含无效字符')
    if (model.length > 50) errors.push('型号长度不能超过50个字符')
    if (model.startsWith('-') || model.endsWith('-')) errors.push('型号不能以连字符开头或结尾')
    if (model.includes('--')) errors.push('型号不能包含连续的连字符')
    return { isValid: errors.length === 0, errors }
  }
}
