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
    disabled: {
      label: {
        en: 'Disabled',
        pt: 'Desabilitado'
      },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
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
      }
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
  ]
}
