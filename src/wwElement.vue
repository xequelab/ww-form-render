<template>
  <div class="form-renderer" :class="{ 'form-loading': isSubmitting }">
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
      <button
        v-if="content.showSubmitButton"
        type="submit"
        class="form-submit"
        :disabled="disabled || isSubmitting"
      >
        {{ isSubmitting ? 'Enviando...' : content.submitButtonText }}
      </button>
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
  computed: {
    fields() {
      return this.content.schema?.fields || []
    },
    disabled() {
      return this.content.disabled || false
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
          if (field.type === 'checkbox') {
            data[field.fieldId] = false
          } else if (field.type === 'number') {
            data[field.fieldId] = null
          } else {
            data[field.fieldId] = ''
          }
        }
      })
      this.formData = data
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

      this.$emit('submit', submitData)

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
    },

    reset() {
      this.initializeFormData()
      this.errors = {}
      this.showSuccessMessage = false
    },

    clearErrors() {
      this.errors = {}
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
  margin-bottom: 1.5rem;
}

.form-field:last-of-type {
  margin-bottom: 2rem;
}

/* Labels */
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.required-indicator {
  color: #dc2626;
  margin-left: 2px;
  font-weight: 700;
}

/* Help Text */
.help-text {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-top: 0.375rem;
  line-height: 1.4;
}

/* Error Messages */
.error-message {
  display: block;
  font-size: 13px;
  color: #dc2626;
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
  font-size: 15px;
  font-family: inherit;
  line-height: 1.5;
  color: #1f2937;
  background-color: #ffffff;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
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
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.form-input.error:focus,
.form-textarea.error:focus,
.form-select.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
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
  border: 1.5px solid #d1d5db;
  transition: all 0.15s ease;
}

.form-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.form-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-checkbox-label {
  font-size: 15px;
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
}

.form-radio:checked {
  accent-color: #3b82f6;
}

.form-radio:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-radio-label {
  font-size: 15px;
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
.form-submit {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background-color: #3b82f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-submit:hover:not(:disabled) {
  background-color: #2563eb;
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
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Success Message */
.form-success {
  padding: 1rem;
  background-color: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 6px;
  color: #065f46;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideDown 0.3s ease-out;
}

.form-success-icon {
  width: 20px;
  height: 20px;
  color: #10b981;
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
  border-top: 3px solid #3b82f6;
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
</style>
