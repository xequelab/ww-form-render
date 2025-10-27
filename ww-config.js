export default {
  editor: {
    label: {
      en: 'Form Renderer',
      pt: 'Renderizador de Formulário'
    },
    icon: 'fontawesome/solid/file-alt',
  },
  properties: {
    schema: {
      label: {
        en: 'Form Schema',
        pt: 'Schema do Formulário'
      },
      type: 'Info',
      section: 'settings',
      bindable: true,
      defaultValue: { fields: [] },
      options: {
        text: {
          en: 'Connect the form schema from Form Builder component',
          pt: 'Conecte o schema do formulário do componente Form Builder'
        }
      }
    },
    initialData: {
      label: {
        en: 'Initial Data',
        pt: 'Dados Iniciais'
      },
      type: 'Info',
      section: 'settings',
      bindable: true,
      defaultValue: {},
      options: {
        text: {
          en: 'Optional: Pre-fill form with existing data (for edit mode)',
          pt: 'Opcional: Pré-preencher formulário com dados existentes (modo edição)'
        }
      }
    },
    showSubmitButton: {
      label: {
        en: 'Show Submit Button',
        pt: 'Mostrar Botão de Envio'
      },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true
    },
    submitButtonText: {
      label: {
        en: 'Submit Button Text',
        pt: 'Texto do Botão'
      },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Enviar',
      hidden: (content) => !content.showSubmitButton
    },
    submitButtonAlign: {
      label: {
        en: 'Submit Button Alignment',
        pt: 'Alinhamento do Botão'
      },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'left', label: { en: 'Left', pt: 'Esquerda' } },
          { value: 'center', label: { en: 'Center', pt: 'Centro' } },
          { value: 'right', label: { en: 'Right', pt: 'Direita' } }
        ]
      },
      defaultValue: 'left',
      hidden: (content) => !content.showSubmitButton
    },
    disabled: {
      label: {
        en: 'Disabled',
        pt: 'Desabilitado'
      },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      bindable: true
    },
    // Design Customization Section
    primaryColor: {
      label: {
        en: 'Primary Color',
        pt: 'Cor Primária'
      },
      type: 'Color',
      section: 'design',
      defaultValue: '#3b82f6',
      bindable: true
    },
    errorColor: {
      label: {
        en: 'Error Color',
        pt: 'Cor de Erro'
      },
      type: 'Color',
      section: 'design',
      defaultValue: '#dc2626',
      bindable: true
    },
    successColor: {
      label: {
        en: 'Success Color',
        pt: 'Cor de Sucesso'
      },
      type: 'Color',
      section: 'design',
      defaultValue: '#10b981',
      bindable: true
    },
    labelColor: {
      label: {
        en: 'Label Color',
        pt: 'Cor dos Rótulos'
      },
      type: 'Color',
      section: 'design',
      defaultValue: '#1f2937',
      bindable: true
    },
    inputBackgroundColor: {
      label: {
        en: 'Input Background',
        pt: 'Fundo dos Campos'
      },
      type: 'Color',
      section: 'design',
      defaultValue: '#ffffff',
      bindable: true
    },
    inputBorderColor: {
      label: {
        en: 'Input Border Color',
        pt: 'Cor da Borda'
      },
      type: 'Color',
      section: 'design',
      defaultValue: '#d1d5db',
      bindable: true
    },
    labelFontSize: {
      label: {
        en: 'Label Font Size',
        pt: 'Tamanho da Fonte - Rótulos'
      },
      type: 'Length',
      section: 'design',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 10, max: 24 },
          { value: 'rem', label: 'rem', min: 0.5, max: 2 }
        ]
      },
      defaultValue: '14px',
      bindable: true
    },
    inputFontSize: {
      label: {
        en: 'Input Font Size',
        pt: 'Tamanho da Fonte - Campos'
      },
      type: 'Length',
      section: 'design',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 12, max: 20 },
          { value: 'rem', label: 'rem', min: 0.75, max: 1.5 }
        ]
      },
      defaultValue: '15px',
      bindable: true
    },
    buttonFontSize: {
      label: {
        en: 'Button Font Size',
        pt: 'Tamanho da Fonte - Botão'
      },
      type: 'Length',
      section: 'design',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 12, max: 20 },
          { value: 'rem', label: 'rem', min: 0.75, max: 1.5 }
        ]
      },
      defaultValue: '16px',
      bindable: true
    },
    helpTextFontSize: {
      label: {
        en: 'Help Text Font Size',
        pt: 'Tamanho da Fonte - Ajuda'
      },
      type: 'Length',
      section: 'design',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 10, max: 16 },
          { value: 'rem', label: 'rem', min: 0.625, max: 1 }
        ]
      },
      defaultValue: '13px',
      bindable: true
    },
    inputBorderRadius: {
      label: {
        en: 'Input Border Radius',
        pt: 'Arredondamento dos Campos'
      },
      type: 'Length',
      section: 'design',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 0, max: 20 }
        ]
      },
      defaultValue: '6px',
      bindable: true
    },
    buttonBorderRadius: {
      label: {
        en: 'Button Border Radius',
        pt: 'Arredondamento do Botão'
      },
      type: 'Length',
      section: 'design',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 0, max: 20 }
        ]
      },
      defaultValue: '6px',
      bindable: true
    },
    fieldSpacing: {
      label: {
        en: 'Field Spacing',
        pt: 'Espaçamento entre Campos'
      },
      type: 'Length',
      section: 'design',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 8, max: 48 },
          { value: 'rem', label: 'rem', min: 0.5, max: 3 }
        ]
      },
      defaultValue: '1.5rem',
      bindable: true
    }
  },
  actions: [
    {
      name: 'validate',
      label: {
        en: 'Validate Form',
        pt: 'Validar Formulário'
      },
      code: 'validate'
    },
    {
      name: 'getData',
      label: {
        en: 'Get Form Data',
        pt: 'Obter Dados do Formulário'
      },
      code: 'getData'
    },
    {
      name: 'setData',
      label: {
        en: 'Set Form Data',
        pt: 'Definir Dados do Formulário'
      },
      code: 'setData',
      parameters: [
        {
          name: 'data',
          type: 'object',
          defaultValue: {}
        }
      ]
    },
    {
      name: 'reset',
      label: {
        en: 'Reset Form',
        pt: 'Resetar Formulário'
      },
      code: 'reset'
    },
    {
      name: 'clearErrors',
      label: {
        en: 'Clear Errors',
        pt: 'Limpar Erros'
      },
      code: 'clearErrors'
    }
  ],
  triggerEvents: [
    {
      name: 'submit',
      label: {
        en: 'On Submit',
        pt: 'Ao Enviar'
      },
      event: {
        isValid: true,
        data: {},
        errors: {}
      },
      default: true
    },
    {
      name: 'change',
      label: {
        en: 'On Change',
        pt: 'Ao Alterar'
      },
      event: {
        fieldId: '',
        value: '',
        formData: {}
      }
    },
    {
      name: 'validationError',
      label: {
        en: 'On Validation Error',
        pt: 'Ao Erro de Validação'
      },
      event: {
        errors: {}
      }
    }
  ],
  variables: [
    {
      name: 'formData',
      label: {
        en: 'Form Data',
        pt: 'Dados do Formulário'
      },
      type: 'object',
      defaultValue: {},
      readonly: true
    },
    {
      name: 'lastSubmitData',
      label: {
        en: 'Last Submit Data',
        pt: 'Últimos Dados Enviados'
      },
      type: 'object',
      defaultValue: null,
      readonly: true
    },
    {
      name: 'isValid',
      label: {
        en: 'Is Valid',
        pt: 'Está Válido'
      },
      type: 'boolean',
      defaultValue: false,
      readonly: true
    },
    {
      name: 'errors',
      label: {
        en: 'Validation Errors',
        pt: 'Erros de Validação'
      },
      type: 'object',
      defaultValue: {},
      readonly: true
    }
  ]
}
