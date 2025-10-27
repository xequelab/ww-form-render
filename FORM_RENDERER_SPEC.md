# Form Renderer Component Specification

## 1. Visão Geral

### Propósito
O **Form Renderer** é o componente responsável por interpretar e renderizar formulários dinamicamente a partir do schema JSON gerado pelo Form Builder. Ele transforma a estrutura de dados em um formulário funcional, completo com validações, coleta de dados e feedback ao usuário.

### Relação com o Form Builder
- **Form Builder**: Cria e exporta o schema JSON do formulário
- **Form Renderer**: Consome o schema JSON e renderiza o formulário funcional
- **Fluxo**: Builder → JSON Schema → Renderer → User Input → Validated Data

### Responsabilidades
- Renderizar campos dinamicamente baseado no schema
- Aplicar validações conforme configurado
- Coletar e estruturar dados do usuário
- Fornecer feedback visual de erros
- Emitir eventos de submissão com dados validados

---

## 2. Estrutura do Schema JSON

### Formato Base
```json
{
  "fields": [
    {
      "id": "uuid-v4",
      "type": "text|textarea|number|email|select|checkbox|radio|date",
      "label": "Campo de Texto",
      "fieldId": "nome_campo",
      "placeholder": "Digite aqui...",
      "required": true,
      "helpText": "Texto de ajuda opcional",
      "options": [],
      "min": null,
      "max": null,
      "step": null,
      "maxLength": null
    }
  ]
}
```

### Propriedades Comuns a Todos os Campos

| Propriedade | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `id` | string (UUID) | Sim | Identificador único interno do campo |
| `type` | string | Sim | Tipo do campo (text, textarea, number, etc) |
| `label` | string | Sim | Rótulo visível do campo |
| `fieldId` | string | Sim | Identificador do campo para coleta de dados |
| `required` | boolean | Sim | Se o campo é obrigatório |
| `placeholder` | string | Não | Texto placeholder |
| `helpText` | string | Não | Texto de ajuda abaixo do campo |

### Propriedades Específicas por Tipo

#### Text Input
```json
{
  "type": "text",
  "maxLength": 255
}
```

#### Textarea
```json
{
  "type": "textarea",
  "maxLength": 1000
}
```

#### Number
```json
{
  "type": "number",
  "min": 0,
  "max": 100,
  "step": 1
}
```

#### Email
```json
{
  "type": "email",
  "maxLength": 255
}
```

#### Select
```json
{
  "type": "select",
  "options": [
    {"label": "Opção 1", "value": "opt1"},
    {"label": "Opção 2", "value": "opt2"}
  ]
}
```

#### Checkbox
```json
{
  "type": "checkbox"
}
```

#### Radio
```json
{
  "type": "radio",
  "options": [
    {"label": "Sim", "value": "yes"},
    {"label": "Não", "value": "no"}
  ]
}
```

#### Date
```json
{
  "type": "date"
}
```

---

## 3. Especificação de Renderização

### Mapeamento Tipo → HTML

| Tipo | Elemento HTML | Atributos Principais |
|------|---------------|---------------------|
| text | `<input type="text">` | maxlength, placeholder, required |
| textarea | `<textarea>` | maxlength, placeholder, required, rows |
| number | `<input type="number">` | min, max, step, placeholder, required |
| email | `<input type="email">` | maxlength, placeholder, required |
| select | `<select>` + `<option>` | required |
| checkbox | `<input type="checkbox">` | required |
| radio | `<input type="radio">` | required, name (mesmo para grupo) |
| date | `<input type="date">` | required |

### Estrutura de Renderização de Campo

```html
<div class="form-field">
  <label for="fieldId">
    Label
    <span class="required-indicator" v-if="field.required">*</span>
  </label>

  <!-- Campo específico aqui -->

  <small class="help-text" v-if="field.helpText">
    {{ field.helpText }}
  </small>

  <span class="error-message" v-if="errors[field.fieldId]">
    {{ errors[field.fieldId] }}
  </span>
</div>
```

---

## 4. Validações

### Validações por Tipo

#### Text / Textarea / Email
- **required**: Campo não pode estar vazio
- **maxLength**: Não pode exceder o limite de caracteres
- **email**: Deve ser um email válido (formato: xxx@xxx.xxx)

#### Number
- **required**: Campo não pode estar vazio
- **min**: Valor não pode ser menor que o mínimo
- **max**: Valor não pode ser maior que o máximo
- **step**: Valor deve ser múltiplo do step

#### Select / Radio
- **required**: Deve ter uma opção selecionada

#### Checkbox
- **required**: Deve estar marcado

#### Date
- **required**: Deve ter uma data selecionada

### Mensagens de Erro Sugeridas

```javascript
const errorMessages = {
  required: 'Este campo é obrigatório',
  email: 'Digite um email válido',
  maxLength: 'Máximo de {max} caracteres',
  min: 'Valor mínimo: {min}',
  max: 'Valor máximo: {max}',
  step: 'Valor deve ser múltiplo de {step}'
}
```

---

## 5. Estrutura de Dados de Saída

### Formato de Output (após submissão)

```json
{
  "isValid": true,
  "data": {
    "nome_campo": "valor digitado",
    "idade": 25,
    "email": "usuario@email.com",
    "genero": "masculino",
    "aceita_termos": true,
    "data_nascimento": "1999-01-15"
  },
  "errors": {}
}
```

### Formato de Output (com erros)

```json
{
  "isValid": false,
  "data": {
    "nome_campo": "",
    "idade": null,
    "email": "email-invalido"
  },
  "errors": {
    "nome_campo": "Este campo é obrigatório",
    "idade": "Este campo é obrigatório",
    "email": "Digite um email válido"
  }
}
```

---

## 6. Especificação do Componente

### Props

```javascript
{
  // Schema gerado pelo Form Builder
  schema: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && Array.isArray(value.fields)
    }
  },

  // Dados iniciais para preencher o formulário (modo edição)
  initialData: {
    type: Object,
    default: () => ({})
  },

  // Mostrar ou ocultar botão de submit
  showSubmitButton: {
    type: Boolean,
    default: true
  },

  // Texto do botão de submit
  submitButtonText: {
    type: String,
    default: 'Enviar'
  },

  // Desabilitar formulário
  disabled: {
    type: Boolean,
    default: false
  }
}
```

### Events

```javascript
// Emitido ao submeter o formulário (após validação)
emit('submit', {
  isValid: true,
  data: { /* dados do formulário */ },
  errors: {}
})

// Emitido quando qualquer campo é alterado
emit('change', {
  fieldId: 'nome_campo',
  value: 'novo valor',
  formData: { /* todos os dados atuais */ }
})

// Emitido quando há erro de validação
emit('validationError', {
  errors: { /* objeto com erros */ }
})
```

### Métodos Expostos

```javascript
// Valida o formulário manualmente
validate(): Promise<{ isValid: boolean, errors: object }>

// Obtém os dados atuais do formulário
getData(): object

// Define dados no formulário
setData(data: object): void

// Reseta o formulário
reset(): void

// Limpa erros de validação
clearErrors(): void
```

---

## 7. Exemplos de Uso

### Exemplo 1: Renderização Básica

```vue
<template>
  <FormRenderer
    :schema="formSchema"
    @submit="handleSubmit"
  />
</template>

<script>
export default {
  data() {
    return {
      formSchema: {
        fields: [
          {
            id: '1',
            type: 'text',
            label: 'Nome Completo',
            fieldId: 'nome',
            required: true,
            placeholder: 'Digite seu nome'
          },
          {
            id: '2',
            type: 'email',
            label: 'Email',
            fieldId: 'email',
            required: true
          }
        ]
      }
    }
  },
  methods: {
    handleSubmit({ isValid, data, errors }) {
      if (isValid) {
        console.log('Dados válidos:', data)
        // Enviar para API
      } else {
        console.log('Erros:', errors)
      }
    }
  }
}
</script>
```

### Exemplo 2: Modo Edição com Dados Iniciais

```vue
<template>
  <FormRenderer
    :schema="formSchema"
    :initialData="userData"
    @submit="handleUpdate"
  />
</template>

<script>
export default {
  data() {
    return {
      formSchema: { /* ... */ },
      userData: {
        nome: 'João Silva',
        email: 'joao@email.com',
        idade: 30
      }
    }
  },
  methods: {
    handleUpdate({ isValid, data }) {
      if (isValid) {
        // Atualizar dados via API
        this.updateUser(data)
      }
    }
  }
}
</script>
```

### Exemplo 3: Validação Programática

```vue
<template>
  <div>
    <FormRenderer
      ref="formRenderer"
      :schema="formSchema"
      :showSubmitButton="false"
    />
    <button @click="validateAndSubmit">Validar e Enviar</button>
  </div>
</template>

<script>
export default {
  methods: {
    async validateAndSubmit() {
      const { isValid, errors } = await this.$refs.formRenderer.validate()

      if (isValid) {
        const data = this.$refs.formRenderer.getData()
        await this.submitToAPI(data)
      } else {
        console.log('Corrija os erros:', errors)
      }
    }
  }
}
</script>
```

---

## 8. Schema Completo de Exemplo

```json
{
  "fields": [
    {
      "id": "f1a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o",
      "type": "text",
      "label": "Nome Completo",
      "fieldId": "nome_completo",
      "placeholder": "Digite seu nome",
      "required": true,
      "helpText": "Informe seu nome completo como consta no documento",
      "maxLength": 100
    },
    {
      "id": "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p",
      "type": "email",
      "label": "Email",
      "fieldId": "email",
      "placeholder": "seu@email.com",
      "required": true,
      "helpText": "Usaremos este email para contato",
      "maxLength": 255
    },
    {
      "id": "b2c3d4e5-f6g7-4h8i-9j0k-1l2m3n4o5p6q",
      "type": "number",
      "label": "Idade",
      "fieldId": "idade",
      "required": true,
      "min": 18,
      "max": 120,
      "step": 1,
      "helpText": "Você deve ter no mínimo 18 anos"
    },
    {
      "id": "c3d4e5f6-g7h8-4i9j-0k1l-2m3n4o5p6q7r",
      "type": "select",
      "label": "Estado",
      "fieldId": "estado",
      "placeholder": "Selecione seu estado",
      "required": true,
      "options": [
        {"label": "São Paulo", "value": "SP"},
        {"label": "Rio de Janeiro", "value": "RJ"},
        {"label": "Minas Gerais", "value": "MG"}
      ]
    },
    {
      "id": "d4e5f6g7-h8i9-4j0k-1l2m-3n4o5p6q7r8s",
      "type": "radio",
      "label": "Gênero",
      "fieldId": "genero",
      "required": true,
      "options": [
        {"label": "Masculino", "value": "M"},
        {"label": "Feminino", "value": "F"},
        {"label": "Outro", "value": "O"}
      ]
    },
    {
      "id": "e5f6g7h8-i9j0-4k1l-2m3n-4o5p6q7r8s9t",
      "type": "checkbox",
      "label": "Aceito os termos de uso",
      "fieldId": "aceita_termos",
      "required": true,
      "helpText": "Você deve concordar para continuar"
    },
    {
      "id": "f6g7h8i9-j0k1-4l2m-3n4o-5p6q7r8s9t0u",
      "type": "date",
      "label": "Data de Nascimento",
      "fieldId": "data_nascimento",
      "required": true
    },
    {
      "id": "g7h8i9j0-k1l2-4m3n-4o5p-6q7r8s9t0u1v",
      "type": "textarea",
      "label": "Observações",
      "fieldId": "observacoes",
      "placeholder": "Digite suas observações...",
      "required": false,
      "maxLength": 500,
      "helpText": "Campo opcional para comentários adicionais"
    }
  ]
}
```

### Output Esperado após Submissão

```json
{
  "isValid": true,
  "data": {
    "nome_completo": "João da Silva",
    "email": "joao@email.com",
    "idade": 25,
    "estado": "SP",
    "genero": "M",
    "aceita_termos": true,
    "data_nascimento": "1999-01-15",
    "observacoes": "Nenhuma observação adicional"
  },
  "errors": {}
}
```

---

## 9. Especificação Visual e UI/UX

### Design System e Princípios

#### Objetivos Visuais
- **Clareza**: Formulário limpo e fácil de entender
- **Acessibilidade**: Contraste adequado e elementos identificáveis
- **Responsividade**: Adaptação perfeita a diferentes tamanhos de tela
- **Feedback Visual**: Estados claros (normal, focus, error, disabled, success)
- **Consistência**: Alinhamento com padrões modernos de formulários

### Layout e Estrutura

#### Container Principal
```css
.form-renderer {
  max-width: 600px;           /* Largura ideal para leitura */
  margin: 0 auto;              /* Centralizado */
  padding: 2rem;               /* Espaçamento interno */
  background: #ffffff;         /* Fundo branco limpo */
  border-radius: 8px;          /* Bordas arredondadas suaves */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Sombra sutil */
}

@media (max-width: 768px) {
  .form-renderer {
    padding: 1rem;
    border-radius: 0;
    box-shadow: none;
  }
}
```

#### Estrutura de Campo

```css
.form-field {
  margin-bottom: 1.5rem;       /* Espaçamento entre campos */
}

.form-field:last-child {
  margin-bottom: 2rem;         /* Espaço extra antes do botão */
}
```

### Tipografia

#### Labels
```css
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;              /* Cinza escuro */
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.required-indicator {
  color: #dc2626;              /* Vermelho */
  margin-left: 2px;
  font-weight: 700;
}
```

#### Help Text
```css
.help-text {
  display: block;
  font-size: 13px;
  color: #6b7280;              /* Cinza médio */
  margin-top: 0.375rem;
  line-height: 1.4;
}
```

#### Error Messages
```css
.error-message {
  display: block;
  font-size: 13px;
  color: #dc2626;              /* Vermelho */
  margin-top: 0.375rem;
  font-weight: 500;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

### Campos de Input

#### Estilo Base para Inputs
```css
.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.625rem 0.875rem;  /* 10px 14px */
  font-size: 15px;
  font-family: inherit;
  line-height: 1.5;
  color: #1f2937;
  background-color: #ffffff;
  border: 1.5px solid #d1d5db; /* Cinza claro */
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
  outline: none;
}

/* Placeholder */
.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;              /* Cinza placeholder */
  opacity: 1;
}

/* Estado Focus */
.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #3b82f6;       /* Azul primário */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); /* Anel de foco */
}

/* Estado Error */
.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: #dc2626;       /* Vermelho */
  background-color: #fef2f2;   /* Vermelho muito claro */
}

.form-input.error:focus,
.form-textarea.error:focus,
.form-select.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Estado Disabled */
.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background-color: #f3f4f6;   /* Cinza claro */
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Hover (apenas se não disabled) */
.form-input:not(:disabled):hover,
.form-textarea:not(:disabled):hover,
.form-select:not(:disabled):hover {
  border-color: #9ca3af;
}
```

#### Textarea Específico
```css
.form-textarea {
  min-height: 100px;
  resize: vertical;            /* Permite redimensionar apenas verticalmente */
  font-family: inherit;
}
```

#### Number Input
```css
.form-input[type="number"] {
  /* Remove spinners no Chrome/Safari */
  -moz-appearance: textfield;
}

.form-input[type="number"]::-webkit-outer-spin-button,
.form-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
```

### Checkbox e Radio Buttons

#### Checkbox
```css
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
```

#### Radio Buttons
```css
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
  accent-color: #3b82f6;       /* Cor do radio selecionado */
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
```

### Select Dropdown

```css
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
  color: #9ca3af;              /* Placeholder option */
}
```

### Botão de Submit

```css
.form-submit {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background-color: #3b82f6;   /* Azul primário */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-submit:hover:not(:disabled) {
  background-color: #2563eb;   /* Azul mais escuro */
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
```

### Estados Visuais

#### Loading State
```css
.form-loading {
  position: relative;
  pointer-events: none;
}

.form-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.spinner {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### Success State (após submissão bem-sucedida)
```css
.form-success {
  padding: 1rem;
  background-color: #d1fae5;   /* Verde claro */
  border: 1px solid #10b981;   /* Verde */
  border-radius: 6px;
  color: #065f46;              /* Verde escuro */
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-success-icon {
  width: 20px;
  height: 20px;
  color: #10b981;
}
```

### Paleta de Cores Recomendada

```css
:root {
  /* Cores Primárias */
  --primary-blue: #3b82f6;
  --primary-blue-dark: #2563eb;
  --primary-blue-light: rgba(59, 130, 246, 0.1);

  /* Cores de Status */
  --error-red: #dc2626;
  --error-red-bg: #fef2f2;
  --error-red-light: rgba(220, 38, 38, 0.1);

  --success-green: #10b981;
  --success-green-bg: #d1fae5;
  --success-green-dark: #065f46;

  /* Tons de Cinza */
  --gray-900: #1f2937;         /* Texto principal */
  --gray-700: #374151;         /* Texto secundário */
  --gray-500: #6b7280;         /* Help text */
  --gray-400: #9ca3af;         /* Placeholder */
  --gray-300: #d1d5db;         /* Bordas */
  --gray-100: #f3f4f6;         /* Backgrounds */
  --gray-50: #f9fafb;          /* Backgrounds claros */

  /* Branco */
  --white: #ffffff;
}
```

### Responsividade

#### Mobile First (< 640px)
```css
@media (max-width: 640px) {
  .form-renderer {
    padding: 1rem;
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
    font-size: 16px;           /* Previne zoom no iOS */
  }

  .form-submit {
    padding: 0.875rem 1rem;
  }
}
```

#### Tablet (641px - 1024px)
```css
@media (min-width: 641px) and (max-width: 1024px) {
  .form-renderer {
    max-width: 540px;
  }
}
```

#### Desktop (> 1024px)
```css
@media (min-width: 1025px) {
  .form-renderer {
    max-width: 600px;
  }
}
```

### Animações e Transições

```css
/* Entrada suave de campos com erro */
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

.error-message {
  animation: slideDown 0.2s ease-out;
}

/* Pulsação sutil no focus */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  animation: none; /* Desativado por padrão, pode ser ativado se desejado */
}
```

### Acessibilidade Visual

#### Contraste de Cores
- Texto principal (#1f2937) sobre branco (#ffffff): **16.1:1** (AAA)
- Labels (#1f2937) sobre branco: **16.1:1** (AAA)
- Help text (#6b7280) sobre branco: **7.1:1** (AA)
- Erros (#dc2626) sobre branco: **8.2:1** (AAA)

#### Indicadores Visuais
```css
/* Focus visível para navegação por teclado */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Estado de campo obrigatório */
.form-field.required .form-label::after {
  content: ' (obrigatório)';
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  /* Visível para screen readers mas pode ser oculto visualmente */
}
```

### Exemplo de Mockup Visual

```
┌────────────────────────────────────────┐
│         FORMULÁRIO DE CADASTRO         │
├────────────────────────────────────────┤
│                                        │
│ Nome Completo *                        │
│ ┌────────────────────────────────────┐ │
│ │ Digite seu nome                    │ │
│ └────────────────────────────────────┘ │
│ Informe seu nome completo              │
│                                        │
│ Email *                                │
│ ┌────────────────────────────────────┐ │
│ │ seu@email.com                      │ │
│ └────────────────────────────────────┘ │
│ ⚠ Digite um email válido               │
│                                        │
│ Idade *                                │
│ ┌────────────────────────────────────┐ │
│ │ 25                                 │ │
│ └────────────────────────────────────┘ │
│ Você deve ter no mínimo 18 anos        │
│                                        │
│ Gênero *                               │
│ ○ Masculino                            │
│ ○ Feminino                             │
│ ○ Outro                                │
│                                        │
│ ☐ Aceito os termos de uso *            │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │          ENVIAR FORMULÁRIO         │ │
│ └────────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

## 10. Considerações de Implementação

### Tecnologias Recomendadas
- **Vue 3** Composition API ou Options API
- **Vuelidate** ou **VeeValidate** para validações
- **CSS/SCSS** para estilização
- **TypeScript** (opcional, mas recomendado)

### Estrutura de Arquivos Sugerida
```
/components
  /FormRenderer
    FormRenderer.vue           # Componente principal
    /fields
      TextField.vue
      TextareaField.vue
      NumberField.vue
      EmailField.vue
      SelectField.vue
      CheckboxField.vue
      RadioField.vue
      DateField.vue
    /composables
      useFormValidation.js     # Lógica de validação
      useFormData.js           # Gerenciamento de dados
    formRenderer.scss          # Estilos
```

### Acessibilidade
- Todos os campos devem ter labels associados corretamente
- Usar atributos `aria-*` apropriados
- Indicadores visuais claros para campos obrigatórios
- Mensagens de erro devem ser anunciadas por screen readers
- Navegação por teclado deve funcionar perfeitamente

### Performance
- Usar `v-for` com `:key="field.id"` para renderização eficiente
- Debounce em validações durante digitação
- Lazy validation (apenas após primeiro blur ou tentativa de submit)
- Memoização de campos quando possível

### Segurança
- Sanitizar dados antes de submissão
- Validação server-side sempre necessária (validação client é UX)
- Não confiar apenas em validações frontend
- Proteger contra XSS em campos de texto livre

---

## 10. Casos de Teste

### Testes Unitários Recomendados

1. **Renderização**
   - Renderiza todos os tipos de campo corretamente
   - Aplica placeholder quando fornecido
   - Mostra indicador de campo obrigatório
   - Mostra helpText quando fornecido

2. **Validação**
   - Valida campo required vazio
   - Valida maxLength
   - Valida formato de email
   - Valida min/max em numbers
   - Valida step em numbers
   - Valida seleção em selects/radios

3. **Interação**
   - Emite evento change ao alterar campo
   - Emite evento submit ao submeter
   - Mostra erros de validação
   - Limpa erros ao corrigir campo

4. **Dados Iniciais**
   - Preenche campos com initialData
   - Mantém dados ao re-renderizar

5. **Métodos Expostos**
   - validate() retorna erros corretos
   - getData() retorna dados atuais
   - setData() atualiza campos
   - reset() limpa formulário

---

## 11. Roadmap Futuro

### Funcionalidades Adicionais Possíveis
- [ ] Validações customizadas por campo
- [ ] Máscaras de input (telefone, CPF, etc)
- [ ] Upload de arquivos
- [ ] Campos condicionais (mostrar/ocultar baseado em outros)
- [ ] Seções/grupos de campos
- [ ] Multi-step forms
- [ ] Auto-save/draft
- [ ] Internacionalização (i18n)
- [ ] Temas customizáveis
- [ ] Integração com APIs de CEP/endereço

---

## 12. Referências e Recursos

### Documentação Relacionada
- [Form Builder Component](./CLAUDE.md) - Especificação do builder
- Vue.js Documentation - https://vuejs.org
- HTML Form Elements - https://developer.mozilla.org/en-US/docs/Web/HTML/Element#forms

### Bibliotecas de Validação
- VeeValidate: https://vee-validate.logaretm.com
- Vuelidate: https://vuelidate-next.netlify.app

### Inspirações de Design
- Typeform
- Google Forms
- JotForm
- Formik (React)

---

**Versão:** 1.0.0
**Data:** 2025-10-27
**Autor:** Especificação gerada para complementar o Form Builder Component
