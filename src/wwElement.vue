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

    <!-- Form Fields -->
    <form @submit.prevent="handleSubmit" novalidate>
      <div
        v-for="field in fields"
        :key="field.id"
        class="form-field"
        :class="{ 'has-error': errors[field.fieldId] }"
      >
        <!-- Label -->
        <label :for="field.fieldId" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required-indicator">*</span>
        </label>

        <!-- Text Input -->
        <input
          v-if="field.type === 'text'"
          :id="field.fieldId"
          v-model="formData[field.fieldId]"
          type="text"
          class="form-input"
          :class="{ error: errors[field.fieldId] }"
          :placeholder="field.placeholder"
          :maxlength="field.maxLength"
          :disabled="disabled"
          @blur="validateField(field)"
        />

        <!-- Textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.fieldId"
          v-model="formData[field.fieldId]"
          class="form-textarea"
          :class="{ error: errors[field.fieldId] }"
          :placeholder="field.placeholder"
          :maxlength="field.maxLength"
          :disabled="disabled"
          @blur="validateField(field)"
        ></textarea>

        <!-- Number Input -->
        <input
          v-else-if="field.type === 'number'"
          :id="field.fieldId"
          v-model.number="formData[field.fieldId]"
          type="number"
          class="form-input"
          :class="{ error: errors[field.fieldId] }"
          :placeholder="field.placeholder"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          :disabled="disabled"
          @blur="validateField(field)"
        />

        <!-- Email Input -->
        <input
          v-else-if="field.type === 'email'"
          :id="field.fieldId"
          v-model="formData[field.fieldId]"
          type="email"
          class="form-input"
          :class="{ error: errors[field.fieldId] }"
          :placeholder="field.placeholder"
          :maxlength="field.maxLength"
          :disabled="disabled"
          @blur="validateField(field)"
        />

        <!-- Select Dropdown -->
        <select
          v-else-if="field.type === 'select'"
          :id="field.fieldId"
          v-model="formData[field.fieldId]"
          class="form-select"
          :class="{ error: errors[field.fieldId] }"
          :disabled="disabled"
          @blur="validateField(field)"
        >
          <option value="" disabled>{{ field.placeholder || 'Selecione uma opção' }}</option>
          <option v-for="option in field.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Checkbox -->
        <div v-else-if="field.type === 'checkbox'" class="form-checkbox-wrapper">
          <input
            :id="field.fieldId"
            v-model="formData[field.fieldId]"
            type="checkbox"
            class="form-checkbox"
            :disabled="disabled"
            @change="validateField(field)"
          />
          <label :for="field.fieldId" class="form-checkbox-label">
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
              :id="`${field.fieldId}-${option.value}`"
              v-model="formData[field.fieldId]"
              type="radio"
              :name="field.fieldId"
              :value="option.value"
              class="form-radio"
              :disabled="disabled"
              @change="validateField(field)"
            />
            <label :for="`${field.fieldId}-${option.value}`" class="form-radio-label">
              {{ option.label }}
            </label>
          </div>
        </div>

        <!-- Date Input -->
        <input
          v-else-if="field.type === 'date'"
          :id="field.fieldId"
          v-model="formData[field.fieldId]"
          type="date"
          class="form-input"
          :class="{ error: errors[field.fieldId] }"
          :disabled="disabled"
          @blur="validateField(field)"
        />

        <!-- Phone Input -->
        <input
          v-else-if="field.type === 'phone'"
          :id="field.fieldId"
          v-model="formData[field.fieldId]"
          type="tel"
          class="form-input"
          :class="{ error: errors[field.fieldId] }"
          :placeholder="field.placeholder || field.mask"
          :disabled="disabled"
          @blur="validateField(field)"
          @input="applyPhoneMask(field)"
        />

        <!-- Toggle Switch -->
        <div v-else-if="field.type === 'toggle'" class="form-toggle-wrapper">
          <label class="toggle-switch">
            <input
              :id="field.fieldId"
              v-model="formData[field.fieldId]"
              type="checkbox"
              class="toggle-input"
              :disabled="disabled"
              @change="validateField(field)"
            />
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">
            {{ formData[field.fieldId] ? (field.labelOn || 'Ativado') : (field.labelOff || 'Desativado') }}
          </span>
        </div>

        <!-- Slider -->
        <div v-else-if="field.type === 'slider'" class="form-slider-wrapper">
          <input
            :id="field.fieldId"
            v-model.number="formData[field.fieldId]"
            type="range"
            class="form-slider"
            :min="field.min || 0"
            :max="field.max || 100"
            :step="field.step || 1"
            :disabled="disabled"
            @input="validateField(field)"
          />
          <div class="slider-value">
            {{ formData[field.fieldId] }}{{ field.unit || '' }}
          </div>
        </div>

        <!-- Address Fields -->
        <div v-else-if="field.type === 'address'" class="form-address-wrapper">
          <div class="address-row">
            <div class="address-field full-width">
              <input
                type="text"
                v-model="formData[field.fieldId + '_street']"
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
                v-model="formData[field.fieldId + '_number']"
                placeholder="Número"
                class="form-input"
                :disabled="disabled"
              />
            </div>
            <div class="address-field">
              <input
                type="text"
                v-model="formData[field.fieldId + '_complement']"
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
                v-model="formData[field.fieldId + '_neighborhood']"
                placeholder="Bairro"
                class="form-input"
                :disabled="disabled"
              />
            </div>
            <div class="address-field">
              <input
                type="text"
                v-model="formData[field.fieldId + '_city']"
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
                v-model="formData[field.fieldId + '_state']"
                placeholder="Estado"
                class="form-input"
                :disabled="disabled"
              />
            </div>
            <div class="address-field">
              <input
                type="text"
                v-model="formData[field.fieldId + '_zipcode']"
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
              :id="field.fieldId"
              v-model="formData[field.fieldId]"
              type="checkbox"
              class="form-checkbox"
              :disabled="disabled"
              @change="validateField(field)"
            />
            <span class="consent-text" v-html="formatConsentText(field)"></span>
          </label>
        </div>

        <!-- Help Text -->
        <small v-if="field.helpText" class="help-text">
          {{ field.helpText }}
        </small>

        <!-- Error Message -->
        <span v-if="errors[field.fieldId]" class="error-message">
          {{ errors[field.fieldId] }}
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
      showSuccessMessage: false
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

    return {
      formDataVar,
      setFormDataVar,
      lastSubmitDataVar,
      setLastSubmitDataVar,
      isValidVar,
      setIsValidVar,
      errorsVar,
      setErrorsVar
    }
  },
  computed: {
    fields() {
      return this.content.schema?.fields || []
    },
    disabled() {
      return this.content.disabled || false
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
    initializeFormData() {
      const data = {}
      this.fields.forEach(field => {
        if (this.content.initialData && this.content.initialData[field.fieldId] !== undefined) {
          data[field.fieldId] = this.content.initialData[field.fieldId]
        } else {
          // Initialize with default values based on type
          if (field.type === 'checkbox' || field.type === 'toggle' || field.type === 'consent') {
            data[field.fieldId] = field.defaultValue !== undefined ? field.defaultValue : false
          } else if (field.type === 'number' || field.type === 'slider') {
            data[field.fieldId] = field.defaultValue !== undefined ? field.defaultValue : (field.min || 0)
          } else if (field.type === 'address') {
            // Initialize address sub-fields
            data[field.fieldId + '_street'] = ''
            data[field.fieldId + '_number'] = ''
            data[field.fieldId + '_complement'] = ''
            data[field.fieldId + '_neighborhood'] = ''
            data[field.fieldId + '_city'] = ''
            data[field.fieldId + '_state'] = ''
            data[field.fieldId + '_zipcode'] = ''
          } else if (field.type === 'link' || field.type === 'separator') {
            // Links and separators don't need data
            // Skip initialization
          } else {
            data[field.fieldId] = ''
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

      // Check if form is currently valid
      const isValid = Object.keys(this.errors).length === 0 &&
                      this.fields.length > 0 &&
                      this.fields.every(field => {
                        if (field.required) {
                          const value = this.formData[field.fieldId]
                          if (field.type === 'checkbox') return value === true
                          if (field.type === 'number') return value !== null && value !== '' && !isNaN(value)
                          return value && value.toString().trim() !== ''
                        }
                        return true
                      })

      this.setIsValidVar(isValid)
    },

    validateField(field) {
      const value = this.formData[field.fieldId]
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
        this.errors = { ...this.errors, [field.fieldId]: error }
      } else {
        const newErrors = { ...this.errors }
        delete newErrors[field.fieldId]
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
    },

    clearErrors() {
      this.errors = {}
    },

    applyPhoneMask(field) {
      if (!field.mask) return

      let value = this.formData[field.fieldId].replace(/\D/g, '')

      // Apply Brazilian phone mask (99) 99999-9999
      if (field.country === 'BR' || field.mask === '(99) 99999-9999') {
        if (value.length <= 11) {
          value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
          value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
          value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
        }
      }

      this.formData[field.fieldId] = value
    },

    formatConsentText(field) {
      let text = field.consentText || field.label || ''

      // If there's a link URL, make it clickable
      if (field.linkUrl && field.linkText) {
        const linkHtml = `<a href="${field.linkUrl}" target="_blank" rel="noopener noreferrer" class="consent-link">${field.linkText}</a>`
        text = text.replace(field.linkText, linkHtml)
      }

      return text
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
</style>
