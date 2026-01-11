<template>
  <div
    class="form-renderer"
    :class="{ 'form-loading': isSubmitting }"
    :style="cssVariables"
  >
    <!-- Success Message -->
    <div v-if="showSuccessMessage" class="form-success">
      <svg class="form-success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Formulário enviado com sucesso!</span>
    </div>

    <!-- Duplicate Client Modal -->
    <div v-if="showDuplicateModal" class="modal-overlay" @click="closeDuplicateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Cliente já cadastrado</h3>
          <button class="modal-close" @click="closeDuplicateModal" type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-message">Encontramos um cliente com este email ou telefone já cadastrado:</p>
          <div v-if="duplicateClient" class="duplicate-info">
            <div class="duplicate-field">
              <span class="duplicate-label">Nome:</span>
              <span class="duplicate-value">{{ duplicateClient.nome }}</span>
            </div>
            <div class="duplicate-field">
              <span class="duplicate-label">Email:</span>
              <span class="duplicate-value">{{ duplicateClient.email }}</span>
            </div>
            <div class="duplicate-field">
              <span class="duplicate-label">Telefone:</span>
              <span class="duplicate-value">{{ formatPhoneNumber(duplicateClient.telefone) }}</span>
            </div>
          </div>
          <p class="modal-question">O que deseja fazer?</p>
        </div>
        <div class="modal-footer">
          <button class="modal-button modal-button-primary" @click="useExistingClient" type="button">
            Usar cliente existente
          </button>
          <button class="modal-button modal-button-secondary" @click="createNewClient" type="button">
            Criar novo cliente
          </button>
        </div>
      </div>
    </div>

    <!-- Form Fields -->
    <form @submit.prevent="handleSubmit" novalidate>
      <div
        v-for="field in fields"
        :key="field.id"
        class="form-field"
        :class="{
          'has-error': errors[getFieldKey(field)],
          'no-label': field.type === 'separator' || field.type === 'link'
        }"
      >
        <!-- Label (hidden for separator and link) -->
        <label
          v-if="field.type !== 'separator' && field.type !== 'link'"
          :for="getFieldKey(field)"
          class="form-label"
        >
          {{ field.label }}
          <span v-if="field.required" class="required-indicator">*</span>
        </label>

        <!-- Text Input -->
        <div v-if="field.type === 'text'" class="input-wrapper" :class="{ 'autocomplete-wrapper': isPrivateMode && isFirstField(field) }">
          <input
            :id="getFieldKey(field)"
            v-model="formData[getFieldKey(field)]"
            type="text"
            class="form-input"
            :class="{ error: errors[getFieldKey(field)] }"
            :placeholder="field.placeholder"
            :maxlength="field.maxLength"
            :disabled="isClientFieldDisabled(field)"
            @input="handleClientNameInput(field)"
            @focus="handleClientFieldFocus(field)"
            @blur="handleClientFieldBlur(field)"
            autocomplete="off"
          />

          <!-- Client Autocomplete Dropdown -->
          <div
            v-if="isPrivateMode && isFirstField(field) && showClientDropdown"
            class="client-dropdown"
          >
            <div
              v-for="client in filteredClients"
              :key="client.id"
              class="client-dropdown-item"
              @click="selectClient(client)"
            >
              <div class="client-name">{{ client.nome }}</div>
              <div class="client-info">{{ client.email }}</div>
            </div>
          </div>
        </div>

        <!-- Textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="getFieldKey(field)"
          v-model="formData[getFieldKey(field)]"
          class="form-textarea"
          :class="{ error: errors[getFieldKey(field)] }"
          :placeholder="field.placeholder"
          :maxlength="field.maxLength"
          :disabled="disabled"
        ></textarea>

        <!-- Number Input -->
        <input
          v-else-if="field.type === 'number'"
          :id="getFieldKey(field)"
          v-model.number="formData[getFieldKey(field)]"
          type="number"
          class="form-input"
          :class="{ error: errors[getFieldKey(field)] }"
          :placeholder="field.placeholder"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          :disabled="disabled"
        />

        <!-- Email Input -->
        <input
          v-else-if="field.type === 'email'"
          :id="getFieldKey(field)"
          v-model="formData[getFieldKey(field)]"
          type="email"
          class="form-input"
          :class="{ error: errors[getFieldKey(field)] }"
          :placeholder="field.placeholder"
          :maxlength="field.maxLength"
          :disabled="isClientFieldDisabled(field)"
        />

        <!-- Select Dropdown -->
        <select
          v-else-if="field.type === 'select'"
          :id="getFieldKey(field)"
          v-model="formData[getFieldKey(field)]"
          class="form-select"
          :class="{ error: errors[getFieldKey(field)] }"
          :disabled="disabled"
        >
          <option value="" disabled>{{ field.placeholder || 'Selecione uma opção' }}</option>
          <option v-for="option in field.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Checkbox -->
        <div v-else-if="field.type === 'checkbox'" class="form-checkbox-wrapper">
          <input
            :id="getFieldKey(field)"
            v-model="formData[getFieldKey(field)]"
            type="checkbox"
            class="form-checkbox"
            :disabled="disabled"
          />
          <label :for="getFieldKey(field)" class="form-checkbox-label">
            {{ field.placeholder || 'Marcar' }}
          </label>
        </div>

        <!-- Radio Buttons -->
        <div v-else-if="field.type === 'radio'" class="form-radio-group">
          <div
            v-for="option in field.options"
            :key="option.value"
            class="form-radio-wrapper"
          >
            <input
              :id="`${getFieldKey(field)}-${option.value}`"
              v-model="formData[getFieldKey(field)]"
              type="radio"
              :name="getFieldKey(field)"
              :value="option.value"
              class="form-radio"
              :disabled="disabled"
            />
            <label :for="`${getFieldKey(field)}-${option.value}`" class="form-radio-label">
              {{ option.label }}
            </label>
          </div>
        </div>

        <!-- Date Input -->
        <input
          v-else-if="field.type === 'date'"
          :id="getFieldKey(field)"
          v-model="formData[getFieldKey(field)]"
          type="date"
          class="form-input"
          :class="{ error: errors[getFieldKey(field)] }"
          :disabled="disabled"
        />

        <!-- Phone Input -->
        <input
          v-else-if="field.type === 'phone'"
          :id="getFieldKey(field)"
          v-model="formData[getFieldKey(field)]"
          type="tel"
          class="form-input"
          :class="{ error: errors[getFieldKey(field)] }"
          :placeholder="field.placeholder || field.mask"
          :disabled="isClientFieldDisabled(field)"
          @input="applyPhoneMask(field)"
        />

        <!-- Toggle Switch -->
        <div v-else-if="field.type === 'toggle'" class="form-toggle-wrapper">
          <label class="toggle-switch">
            <input
              :id="getFieldKey(field)"
              v-model="formData[getFieldKey(field)]"
              type="checkbox"
              class="toggle-input"
              :disabled="disabled"
            />
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">
            {{ formData[getFieldKey(field)] ? (field.labelOn || 'Ativado') : (field.labelOff || 'Desativado') }}
          </span>
        </div>

        <!-- Slider -->
        <div v-else-if="field.type === 'slider'" class="form-slider-wrapper">
          <input
            :id="getFieldKey(field)"
            v-model.number="formData[getFieldKey(field)]"
            type="range"
            class="form-slider"
            :min="field.min || 0"
            :max="field.max || 100"
            :step="field.step || 1"
            :disabled="disabled"
          />
          <div class="slider-value">
            {{ formData[getFieldKey(field)] }}{{ field.unit || '' }}
          </div>
        </div>

        <!-- Address Fields -->
        <div v-else-if="field.type === 'address'" class="form-address-wrapper">
          <div class="address-row">
            <div class="address-field full-width">
              <input
                type="text"
                v-model="formData[getFieldKey(field) + '_street']"
                placeholder="Rua"
                class="form-input"
                :disabled="disabled"
              />
            </div>
          </div>
          <div class="address-row">
            <div class="address-field">
              <input
                type="text"
                v-model="formData[getFieldKey(field) + '_number']"
                placeholder="Número"
                class="form-input"
                :disabled="disabled"
              />
            </div>
            <div class="address-field">
              <input
                type="text"
                v-model="formData[getFieldKey(field) + '_complement']"
                placeholder="Complemento"
                class="form-input"
                :disabled="disabled"
              />
            </div>
          </div>
          <div class="address-row">
            <div class="address-field">
              <input
                type="text"
                v-model="formData[getFieldKey(field) + '_neighborhood']"
                placeholder="Bairro"
                class="form-input"
                :disabled="disabled"
              />
            </div>
            <div class="address-field">
              <input
                type="text"
                v-model="formData[getFieldKey(field) + '_city']"
                placeholder="Cidade"
                class="form-input"
                :disabled="disabled"
              />
            </div>
          </div>
          <div class="address-row">
            <div class="address-field">
              <input
                type="text"
                v-model="formData[getFieldKey(field) + '_state']"
                placeholder="Estado"
                class="form-input"
                :disabled="disabled"
              />
            </div>
            <div class="address-field">
              <input
                type="text"
                v-model="formData[getFieldKey(field) + '_zipcode']"
                placeholder="CEP"
                class="form-input"
                :disabled="disabled"
                maxlength="9"
              />
            </div>
          </div>
        </div>

        <!-- Link -->
        <div v-else-if="field.type === 'link'" class="form-link">
          <a
            :href="field.url"
            :target="field.openNewTab ? '_blank' : '_self'"
            :rel="field.openNewTab ? 'noopener noreferrer' : ''"
            class="link-element"
          >
            {{ field.linkText || field.url }}
          </a>
        </div>

        <!-- Separator -->
        <hr v-else-if="field.type === 'separator'" class="form-separator" />

        <!-- Consent -->
        <div v-else-if="field.type === 'consent'" class="form-consent-wrapper">
          <label class="consent-label">
            <input
              :id="getFieldKey(field)"
              v-model="formData[getFieldKey(field)]"
              type="checkbox"
              class="form-checkbox"
              :disabled="disabled"
            />
            <span class="consent-text" v-html="formatConsentText(field)"></span>
          </label>
        </div>

        <!-- Help Text -->
        <small v-if="field.helpText" class="help-text">
          {{ field.helpText }}
        </small>

        <!-- Error Message -->
        <span v-if="errors[getFieldKey(field)]" class="error-message">
          {{ errors[getFieldKey(field)] }}
        </span>
      </div>

      <!-- Submit Button -->
      <div v-if="content.showSubmitButton" class="button-wrapper" :style="buttonWrapperStyle">
        <button
          type="submit"
          class="form-submit"
          :disabled="disabled || isSubmitting"
        >
          {{ isSubmitting ? 'Enviando...' : content.submitButtonText }}
        </button>
      </div>
    </form>

    <!-- Loading Spinner -->
    <div v-if="isSubmitting" class="spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'FormRenderer',
  props: {
    content: {
      type: Object,
      default: () => ({})
    },
    uid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      formData: {},
      errors: {},
      isSubmitting: false,
      showSuccessMessage: false,
      selectedClientId: null,
      filteredClients: [],
      showClientDropdown: false,
      isClientFieldsDisabled: false,
      showDuplicateModal: false,
      duplicateClient: null,
      allowDuplicateSubmit: false
    }
  },
  setup(props) {
    // Exposed Variables
    const { value: formDataVar, setValue: setFormDataVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'formData',
      type: 'object',
      defaultValue: {}
    })

    const { value: lastSubmitDataVar, setValue: setLastSubmitDataVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'lastSubmitData',
      type: 'object',
      defaultValue: null
    })

    const { value: isValidVar, setValue: setIsValidVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'isValid',
      type: 'boolean',
      defaultValue: false
    })

    const { value: errorsVar, setValue: setErrorsVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'errors',
      type: 'object',
      defaultValue: {}
    })

    const { value: formDataWithLabelsVar, setValue: setFormDataWithLabelsVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'formDataWithLabels',
      type: 'array',
      defaultValue: []
    })

    const { value: selectedClientIdVar, setValue: setSelectedClientIdVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedClientId',
      type: 'string',
      defaultValue: null
    })

    return {
      formDataVar,
      setFormDataVar,
      lastSubmitDataVar,
      setLastSubmitDataVar,
      isValidVar,
      setIsValidVar,
      errorsVar,
      setErrorsVar,
      formDataWithLabelsVar,
      setFormDataWithLabelsVar,
      selectedClientIdVar,
      setSelectedClientIdVar
    }
  },
  computed: {
    fields() {
      return this.content.schema?.fields || []
    },
    disabled() {
      return this.content.disabled || false
    },
    isPrivateMode() {
      return this.content.mode === 'private'
    },
    clientsCollection() {
      return this.content.clientsCollection || []
    },
    firstThreeFields() {
      // Returns the first 3 fields (Nome, Email, Telefone)
      return this.fields.slice(0, 3)
    },
    isFirstField() {
      return (field) => {
        const firstField = this.fields[0]
        return firstField && field.id === firstField.id
      }
    },
    isSecondOrThirdField() {
      return (field) => {
        const secondField = this.fields[1]
        const thirdField = this.fields[2]
        return (secondField && field.id === secondField.id) || (thirdField && field.id === thirdField.id)
      }
    },
    cssVariables() {
      return {
        '--primary-color': this.content.primaryColor || '#3b82f6',
        '--error-color': this.content.errorColor || '#dc2626',
        '--success-color': this.content.successColor || '#10b981',
        '--label-color': this.content.labelColor || '#1f2937',
        '--input-bg-color': this.content.inputBackgroundColor || '#ffffff',
        '--input-border-color': this.content.inputBorderColor || '#d1d5db',
        '--label-font-size': this.content.labelFontSize || '14px',
        '--input-font-size': this.content.inputFontSize || '15px',
        '--button-font-size': this.content.buttonFontSize || '16px',
        '--help-font-size': this.content.helpTextFontSize || '13px',
        '--input-border-radius': this.content.inputBorderRadius || '6px',
        '--button-border-radius': this.content.buttonBorderRadius || '6px',
        '--field-spacing': this.content.fieldSpacing || '1.5rem'
      }
    },
    buttonWrapperStyle() {
      const alignment = this.content.submitButtonAlign || 'left'
      const alignmentMap = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
      }
      return {
        justifyContent: alignmentMap[alignment] || 'flex-start'
      }
    }
  },
  watch: {
    'content.initialData': {
      handler(newData) {
        if (newData && Object.keys(newData).length > 0) {
          this.setData(newData)
        }
      },
      immediate: true,
      deep: true
    },
    'content.schema': {
      handler() {
        this.initializeFormData()
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.initializeFormData()
  },
  methods: {
    getFieldKey(field) {
      // Generate variable name from label, fallback to fieldId
      const label = field.label || field.fieldId
      // Remove special characters, normalize spaces and convert to snake_case
      return label
        .normalize('NFD') // Normalize unicode characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        || field.fieldId // Fallback to fieldId if label processing results in empty string
    },

    initializeFormData() {
      const data = {}
      this.fields.forEach(field => {
        const fieldKey = this.getFieldKey(field)
        if (this.content.initialData && this.content.initialData[fieldKey] !== undefined) {
          data[fieldKey] = this.content.initialData[fieldKey]
        } else {
          // Initialize with default values based on type
          if (field.type === 'checkbox' || field.type === 'toggle' || field.type === 'consent') {
            data[fieldKey] = field.defaultValue !== undefined ? field.defaultValue : false
          } else if (field.type === 'number' || field.type === 'slider') {
            data[fieldKey] = field.defaultValue !== undefined ? field.defaultValue : (field.min || 0)
          } else if (field.type === 'address') {
            // Initialize address sub-fields
            data[fieldKey + '_street'] = ''
            data[fieldKey + '_number'] = ''
            data[fieldKey + '_complement'] = ''
            data[fieldKey + '_neighborhood'] = ''
            data[fieldKey + '_city'] = ''
            data[fieldKey + '_state'] = ''
            data[fieldKey + '_zipcode'] = ''
          } else if (field.type === 'link' || field.type === 'separator') {
            // Links and separators don't need data
            // Skip initialization
          } else {
            data[fieldKey] = ''
          }
        }
      })
      this.formData = data
      this.updateExposedVariables()
    },

    updateExposedVariables() {
      // Update exposed variables
      this.setFormDataVar({ ...this.formData })
      this.setErrorsVar({ ...this.errors })

      // Create formDataWithLabels array for easy rendering
      const formDataWithLabels = this.fields
        .filter(field => field.type !== 'separator' && field.type !== 'link')
        .map(field => {
          const fieldKey = this.getFieldKey(field)
          let value = this.formData[fieldKey]

          // Handle address fields specially
          if (field.type === 'address') {
            const addressParts = [
              this.formData[fieldKey + '_street'],
              this.formData[fieldKey + '_number'],
              this.formData[fieldKey + '_complement'],
              this.formData[fieldKey + '_neighborhood'],
              this.formData[fieldKey + '_city'],
              this.formData[fieldKey + '_state'],
              this.formData[fieldKey + '_zipcode']
            ].filter(part => part && part.trim() !== '')

            value = addressParts.join(', ')
          }

          // Format boolean values
          if (field.type === 'checkbox' || field.type === 'toggle' || field.type === 'consent') {
            value = value ? 'Sim' : 'Não'
          }

          // Format select/radio options to show label instead of value
          if ((field.type === 'select' || field.type === 'radio') && field.options && value) {
            const option = field.options.find(opt => opt.value === value)
            value = option ? option.label : value
          }

          return {
            key: fieldKey,
            label: field.label,
            value: value,
            type: field.type
          }
        })

      this.setFormDataWithLabelsVar(formDataWithLabels)

      // Check if form is currently valid
      const isValid = Object.keys(this.errors).length === 0 &&
                      this.fields.length > 0 &&
                      this.fields.every(field => {
                        if (field.required) {
                          const fieldKey = this.getFieldKey(field)
                          const value = this.formData[fieldKey]
                          if (field.type === 'checkbox') return value === true
                          if (field.type === 'number') return value !== null && value !== '' && !isNaN(value)
                          return value && value.toString().trim() !== ''
                        }
                        return true
                      })

      this.setIsValidVar(isValid)
    },

    validateField(field) {
      const fieldKey = this.getFieldKey(field)
      const value = this.formData[fieldKey]
      let error = null

      // Required validation
      if (field.required) {
        if (field.type === 'checkbox') {
          if (!value) {
            error = 'Este campo é obrigatório'
          }
        } else if (field.type === 'number') {
          if (value === null || value === '' || isNaN(value)) {
            error = 'Este campo é obrigatório'
          }
        } else {
          if (!value || value.toString().trim() === '') {
            error = 'Este campo é obrigatório'
          }
        }
      }

      // Email validation
      if (!error && field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          error = 'Digite um email válido'
        }
      }

      // MaxLength validation
      if (!error && field.maxLength && value && value.toString().length > field.maxLength) {
        error = `Máximo de ${field.maxLength} caracteres`
      }

      // Number validations
      if (!error && field.type === 'number' && value !== null && value !== '') {
        if (field.min !== null && field.min !== undefined && value < field.min) {
          error = `Valor mínimo: ${field.min}`
        }
        if (field.max !== null && field.max !== undefined && value > field.max) {
          error = `Valor máximo: ${field.max}`
        }
        if (field.step && value % field.step !== 0) {
          error = `Valor deve ser múltiplo de ${field.step}`
        }
      }

      // Update errors
      if (error) {
        this.errors = { ...this.errors, [fieldKey]: error }
      } else {
        const newErrors = { ...this.errors }
        delete newErrors[fieldKey]
        this.errors = newErrors
      }

      this.updateExposedVariables()
      return !error
    },

    async validate() {
      this.errors = {}
      let isValid = true

      this.fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false
        }
      })

      return {
        isValid,
        errors: { ...this.errors }
      }
    },

    async handleSubmit() {
      const validation = await this.validate()

      if (!validation.isValid) {
        this.$emit('validationError', { errors: validation.errors })
        return
      }

      // Check for duplicate client (only in private mode)
      if (this.isPrivateMode && !this.allowDuplicateSubmit) {
        const duplicate = this.findDuplicateClient()
        if (duplicate) {
          this.duplicateClient = duplicate
          this.showDuplicateModal = true
          return
        }
      }

      // Reset duplicate flag
      this.allowDuplicateSubmit = false

      this.isSubmitting = true

      // Simulate async submission (remove this in production)
      await new Promise(resolve => setTimeout(resolve, 500))

      const submitData = {
        isValid: true,
        data: { ...this.formData },
        errors: {}
      }

      // Update lastSubmitData variable
      this.setLastSubmitDataVar({ ...this.formData })

      // Emit event with data
      this.$emit('trigger-event', {
        name: 'submit',
        event: submitData
      })

      // Show success message
      this.showSuccessMessage = true
      setTimeout(() => {
        this.showSuccessMessage = false
      }, 3000)

      this.isSubmitting = false
    },

    getData() {
      return { ...this.formData }
    },

    setData(data) {
      this.formData = { ...this.formData, ...data }
      this.updateExposedVariables()
    },

    reset() {
      this.initializeFormData()
      this.errors = {}
      this.showSuccessMessage = false
      this.clearClientSelection()
    },

    clearErrors() {
      this.errors = {}
    },

    applyPhoneMask(field) {
      if (!field.mask) return

      const fieldKey = this.getFieldKey(field)
      let value = this.formData[fieldKey].replace(/\D/g, '')

      // Apply Brazilian phone mask (99) 99999-9999
      if (field.country === 'BR' || field.mask === '(99) 99999-9999') {
        if (value.length <= 11) {
          value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
          value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
          value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
        }
      }

      this.formData[fieldKey] = value
    },

    formatConsentText(field) {
      let text = field.consentText || field.label || ''

      // If there's a link URL, make it clickable
      if (field.linkUrl && field.linkText) {
        const linkHtml = `<a href="${field.linkUrl}" target="_blank" rel="noopener noreferrer" class="consent-link">${field.linkText}</a>`
        text = text.replace(field.linkText, linkHtml)
      }

      return text
    },

    // Private Mode - Client Autocomplete Methods
    handleClientNameInput(field) {
      if (!this.isPrivateMode || !this.isFirstField(field)) return

      const fieldKey = this.getFieldKey(field)
      const searchTerm = this.formData[fieldKey]

      if (!searchTerm || searchTerm.length < 2) {
        this.showClientDropdown = false
        this.filteredClients = []
        this.selectedClientId = null
        this.isClientFieldsDisabled = false
        this.setSelectedClientIdVar(null)
        return
      }

      // Filter clients by name
      this.filteredClients = this.clientsCollection.filter(client =>
        client.nome && client.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )

      this.showClientDropdown = this.filteredClients.length > 0

      // Clear selection if user is typing
      if (this.selectedClientId) {
        this.selectedClientId = null
        this.isClientFieldsDisabled = false
        this.setSelectedClientIdVar(null)
      }
    },

    selectClient(client) {
      if (!client) return

      const firstField = this.fields[0]
      const secondField = this.fields[1]
      const thirdField = this.fields[2]

      if (firstField) {
        const nomeKey = this.getFieldKey(firstField)
        this.formData[nomeKey] = client.nome || ''
        // Clear error for nome field
        const newErrors = { ...this.errors }
        delete newErrors[nomeKey]
        this.errors = newErrors
      }

      if (secondField) {
        const emailKey = this.getFieldKey(secondField)
        this.formData[emailKey] = client.email || ''
        // Clear error for email field
        const newErrors = { ...this.errors }
        delete newErrors[emailKey]
        this.errors = newErrors
      }

      if (thirdField) {
        const telefoneKey = this.getFieldKey(thirdField)
        // Apply phone mask
        const telefone = (client.telefone || '').toString()
        this.formData[telefoneKey] = this.formatPhoneNumber(telefone)
        // Clear error for telefone field
        const newErrors = { ...this.errors }
        delete newErrors[telefoneKey]
        this.errors = newErrors
      }

      this.selectedClientId = client.id
      this.setSelectedClientIdVar(client.id)
      this.isClientFieldsDisabled = true
      this.showClientDropdown = false
      this.filteredClients = []

      this.updateExposedVariables()
    },

    formatPhoneNumber(phone) {
      if (!phone) return ''

      const cleaned = phone.toString().replace(/\D/g, '')

      if (cleaned.length <= 11) {
        let formatted = cleaned.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
        formatted = formatted.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
        formatted = formatted.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
        return formatted
      }

      return phone
    },

    isClientFieldDisabled(field) {
      if (!this.isPrivateMode) return this.disabled

      if (this.isSecondOrThirdField(field) && this.isClientFieldsDisabled) {
        return true
      }

      return this.disabled
    },

    handleClientFieldFocus(field) {
      if (!this.isPrivateMode || !this.isFirstField(field)) return

      const fieldKey = this.getFieldKey(field)
      const searchTerm = this.formData[fieldKey]

      if (searchTerm && searchTerm.length >= 2 && this.filteredClients.length > 0) {
        this.showClientDropdown = true
      }
    },

    handleClientFieldBlur(field) {
      // Delay to allow click on dropdown
      setTimeout(() => {
        this.showClientDropdown = false
      }, 200)
    },

    clearClientSelection() {
      this.selectedClientId = null
      this.setSelectedClientIdVar(null)
      this.isClientFieldsDisabled = false
      this.showClientDropdown = false
      this.filteredClients = []
    },

    findDuplicateClient() {
      if (!this.isPrivateMode || this.selectedClientId) return null

      const firstField = this.fields[0]
      const secondField = this.fields[1]
      const thirdField = this.fields[2]

      if (!firstField || !secondField || !thirdField) return null

      const emailKey = this.getFieldKey(secondField)
      const telefoneKey = this.getFieldKey(thirdField)

      const email = this.formData[emailKey]
      const telefone = this.formData[telefoneKey]

      if (!email && !telefone) return null

      // Find client by email OR phone
      const duplicate = this.clientsCollection.find(client => {
        const emailMatch = email && client.email &&
                          client.email.toLowerCase().trim() === email.toLowerCase().trim()

        const cleanPhone = (phone) => phone ? phone.toString().replace(/\D/g, '') : ''
        const phoneMatch = telefone && client.telefone &&
                          cleanPhone(client.telefone) === cleanPhone(telefone)

        return emailMatch || phoneMatch
      })

      return duplicate || null
    },

    useExistingClient() {
      if (this.duplicateClient) {
        this.selectClient(this.duplicateClient)
        this.showDuplicateModal = false
        this.duplicateClient = null

        // Re-submit after selecting
        setTimeout(() => {
          this.handleSubmit()
        }, 100)
      }
    },

    createNewClient() {
      this.allowDuplicateSubmit = true
      this.showDuplicateModal = false
      this.duplicateClient = null

      // Re-submit allowing duplicate
      setTimeout(() => {
        this.handleSubmit()
      }, 100)
    },

    closeDuplicateModal() {
      this.showDuplicateModal = false
      this.duplicateClient = null
      this.allowDuplicateSubmit = false
    }
  }
}
</script>

<style scoped>
.form-renderer {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.form-field {
  margin-bottom: var(--field-spacing, 1.5rem);
}

.form-field:last-of-type {
  margin-bottom: 2rem;
}

.form-field.no-label {
  margin-bottom: 1rem;
}

/* Labels */
.form-label {
  display: block;
  font-size: var(--label-font-size, 14px);
  font-weight: 600;
  color: var(--label-color, #1f2937);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.required-indicator {
  color: var(--error-color, #dc2626);
  margin-left: 2px;
  font-weight: 700;
}

/* Help Text */
.help-text {
  display: block;
  font-size: var(--help-font-size, 13px);
  color: #6b7280;
  margin-top: 0.375rem;
  line-height: 1.4;
}

/* Error Messages */
.error-message {
  display: block;
  font-size: var(--help-font-size, 13px);
  color: var(--error-color, #dc2626);
  margin-top: 0.375rem;
  font-weight: 500;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Input Fields */
.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: var(--input-font-size, 15px);
  font-family: inherit;
  line-height: 1.5;
  color: #1f2937;
  background-color: var(--input-bg-color, #ffffff);
  border: 1.5px solid var(--input-border-color, #d1d5db);
  border-radius: var(--input-border-radius, 6px);
  transition: all 0.15s ease-in-out;
  outline: none;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 10%, transparent);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: var(--error-color, #dc2626);
  background-color: color-mix(in srgb, var(--error-color, #dc2626) 5%, white);
}

.form-input.error:focus,
.form-textarea.error:focus,
.form-select.error:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--error-color, #dc2626) 10%, transparent);
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-input:not(:disabled):hover,
.form-textarea:not(:disabled):hover,
.form-select:not(:disabled):hover {
  border-color: #9ca3af;
}

/* Textarea */
.form-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

/* Number Input */
.form-input[type="number"] {
  -moz-appearance: textfield;
}

.form-input[type="number"]::-webkit-outer-spin-button,
.form-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Checkbox */
.form-checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  margin: 0;
  margin-right: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  border: 1.5px solid var(--input-border-color, #d1d5db);
  transition: all 0.15s ease;
  accent-color: var(--primary-color, #3b82f6);
}

.form-checkbox:checked {
  background-color: var(--primary-color, #3b82f6);
  border-color: var(--primary-color, #3b82f6);
}

.form-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 10%, transparent);
}

.form-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-checkbox-label {
  font-size: var(--input-font-size, 15px);
  color: #1f2937;
  cursor: pointer;
}

/* Radio Buttons */
.form-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-radio-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.form-radio {
  width: 18px;
  height: 18px;
  margin: 0;
  margin-right: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  accent-color: var(--primary-color, #3b82f6);
}

.form-radio:focus {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 10%, transparent);
}

.form-radio-label {
  font-size: var(--input-font-size, 15px);
  color: #1f2937;
  cursor: pointer;
}

/* Select */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
}

.form-select option {
  padding: 0.5rem;
}

.form-select option[value=""] {
  color: #9ca3af;
}

/* Submit Button */
.button-wrapper {
  display: flex;
  width: 100%;
}

.form-submit {
  padding: 0.75rem 1.5rem;
  font-size: var(--button-font-size, 16px);
  font-weight: 600;
  color: #ffffff;
  background-color: var(--primary-color, #3b82f6);
  border: none;
  border-radius: var(--button-border-radius, 6px);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.form-submit:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--primary-color, #3b82f6) 85%, black);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.form-submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-submit:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-submit:focus {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 30%, transparent);
}

/* Success Message */
.form-success {
  padding: 1rem;
  background-color: color-mix(in srgb, var(--success-color, #10b981) 15%, white);
  border: 1px solid var(--success-color, #10b981);
  border-radius: 6px;
  color: color-mix(in srgb, var(--success-color, #10b981) 85%, black);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideDown 0.3s ease-out;
}

.form-success-icon {
  width: 20px;
  height: 20px;
  color: var(--success-color, #10b981);
  flex-shrink: 0;
}

/* Loading State */
.form-loading {
  pointer-events: none;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid #f3f4f6;
  border-top: 3px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
  z-index: 10;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .form-renderer {
    padding: 1rem;
    border-radius: 0;
    box-shadow: none;
  }

  .form-field {
    margin-bottom: 1.25rem;
  }

  .form-label {
    font-size: 13px;
  }

  .form-input,
  .form-textarea,
  .form-select {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .form-submit {
    padding: 0.875rem 1rem;
  }
}

/* Toggle Switch */
.form-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--primary-color, #3b82f6);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.toggle-input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-label {
  font-size: var(--input-font-size, 15px);
  color: #1f2937;
}

/* Slider */
.form-slider-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-slider {
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #d1d5db;
  outline: none;
  -webkit-appearance: none;
}

.form-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color, #3b82f6);
  cursor: pointer;
}

.form-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color, #3b82f6);
  cursor: pointer;
  border: none;
}

.form-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-value {
  text-align: center;
  font-size: var(--input-font-size, 15px);
  font-weight: 600;
  color: var(--primary-color, #3b82f6);
}

/* Address Fields */
.form-address-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.address-row {
  display: flex;
  gap: 0.75rem;
}

.address-field {
  flex: 1;
}

.address-field.full-width {
  flex: 1 1 100%;
}

/* Link */
.form-link {
  padding: 0.5rem 0;
}

.link-element {
  color: var(--primary-color, #3b82f6);
  text-decoration: underline;
  font-size: var(--input-font-size, 15px);
  cursor: pointer;
  transition: color 0.2s ease;
}

.link-element:hover {
  color: color-mix(in srgb, var(--primary-color, #3b82f6) 75%, black);
}

/* Separator */
.form-separator {
  border: none;
  border-top: 1.5px solid var(--input-border-color, #d1d5db);
  margin: 1rem 0;
}

/* Consent */
.form-consent-wrapper {
  display: flex;
  align-items: flex-start;
}

.consent-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.consent-label .form-checkbox {
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.consent-text {
  font-size: var(--input-font-size, 15px);
  color: #1f2937;
  line-height: 1.5;
}

.consent-link {
  color: var(--primary-color, #3b82f6);
  text-decoration: underline;
  font-weight: 500;
}

.consent-link:hover {
  color: color-mix(in srgb, var(--primary-color, #3b82f6) 75%, black);
}

/* Client Autocomplete Dropdown - Private Mode */
.input-wrapper {
  position: relative;
  width: 100%;
}

.autocomplete-wrapper {
  position: relative;
}

.client-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1.5px solid var(--input-border-color, #d1d5db);
  border-top: none;
  border-radius: 0 0 var(--input-border-radius, 6px) var(--input-border-radius, 6px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 240px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: -1px;
}

.client-dropdown-item {
  padding: 0.75rem 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid #f3f4f6;
}

.client-dropdown-item:last-child {
  border-bottom: none;
}

.client-dropdown-item:hover {
  background-color: color-mix(in srgb, var(--primary-color, #3b82f6) 8%, white);
}

.client-name {
  font-size: var(--input-font-size, 15px);
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.client-info {
  font-size: calc(var(--input-font-size, 15px) - 1px);
  color: #6b7280;
}

/* Autocomplete input focus state */
.autocomplete-wrapper .form-input:focus {
  border-radius: var(--input-border-radius, 6px) var(--input-border-radius, 6px) 0 0;
}

.autocomplete-wrapper .form-input:focus + .client-dropdown {
  border-color: var(--primary-color, #3b82f6);
}

/* Duplicate Client Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.modal-message {
  font-size: 0.9375rem;
  color: #4b5563;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.modal-question {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 1.5rem 0 0 0;
}

.duplicate-info {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.duplicate-field {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.duplicate-field:last-child {
  margin-bottom: 0;
}

.duplicate-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 70px;
}

.duplicate-value {
  font-size: 0.9375rem;
  color: #1f2937;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  flex-direction: column;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: center;
}

.modal-button-primary {
  background-color: var(--primary-color, #3b82f6);
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modal-button-primary:hover {
  background-color: color-mix(in srgb, var(--primary-color, #3b82f6) 85%, black);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.modal-button-secondary {
  background-color: white;
  color: #374151;
  border: 1.5px solid #d1d5db;
}

.modal-button-secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.modal-button:active {
  transform: translateY(0);
}

/* Responsive - Desktop */
@media (min-width: 640px) {
  .modal-footer {
    flex-direction: row;
    justify-content: flex-end;
  }

  .modal-button {
    width: auto;
    min-width: 150px;
  }
}
</style>
