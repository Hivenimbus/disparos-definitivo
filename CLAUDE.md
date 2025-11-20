# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# language comunicate
- **Portuguese**: Only comunicate in Brazilian Portuguese

## Project Overview

**HiveConnect** is a WhatsApp marketing automation platform built with Vue 3 + Nuxt 4 + TypeScript + Tailwind CSS + Supabase. The application provides bulk WhatsApp messaging with advanced contact management, spintax generation, and campaign tracking.

## Ferramentas de Desenvolvimento

### MCP Context7 para Documentação
- **Finalidade**: Acessar documentação atualizada de bibliotecas e frameworks utilizados no projeto
- **Uso recomendado para**: Vue 3, Nuxt 4, TypeScript, Tailwind CSS, Supabase, xlsx
- **Como usar**: Solicite ao Claude: "Use MCP Context7 para buscar documentação sobre [biblioteca/framework]"
- **Benefícios**: Acesso rápido a exemplos de código, APIs atualizadas e melhores práticas
- **Fluxo de trabalho**:
  1. Identificar a biblioteca/framework que precisa de documentação
  2. Solicitar busca via MCP Context7
  3. Aplicar os exemplos e padrões encontrados no código do projeto

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting (if configured)
npm run lint
```

## Architecture Overview

### Technology Stack
- **Frontend**: Vue 3 Composition API with Nuxt 4
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom safelist for WhatsApp icons
- **Database**: Supabase (PostgreSQL)
- **External API**: UAZAPI for WhatsApp integration

### Project Structure
```
app/
├── pages/              # File-based routing (Nuxt 4)
│   ├── index.vue      # Dashboard/main page
│   ├── login.vue      # Authentication
│   ├── register.vue   # User registration
│   ├── admin.vue      # Admin panel
│   ├── campanhas.vue # Campaign management
│   ├── disparos.vue  # Message dispatch
│   └── perfil.vue    # User profile
├── components/        # Reusable Vue components
│   ├── MessageComposer.vue  # Advanced message creation with spintax
│   ├── ContactList.vue      # Contact management with variable support
│   ├── AppHeader.vue         # Navigation and settings
│   └── WhatsAppConnection.vue # WhatsApp API integration
├── layouts/           # Page layouts
│   ├── default.vue   # Main application layout
│   └── auth.vue       # Authentication pages layout
└── utils/            # Utility functions
```

### Authentication System
- **Current**: Hardcoded credentials (`admin@hive.com` / `12345678`)
- **Ready for**: Supabase Auth integration
- **Flow**: Login → Dashboard with company-based access control
- **Registration**: Complete UI implemented with validation

### Database Integration
- **Supabase**: Configured in `.env` with API keys and URL
- **Current State**: Frontend ready, database tables need creation
- **Authentication**: Supabase Auth configured but not implemented
- **Storage**: Available for media files and attachments

## Key Components

### MessageComposer.vue
- **Purpose**: Advanced message creation with spintax and attachments
- **Features**:
  - Spintax modal with 9-field progressive system
  - Variable insertion (`{nome}`, `{nome_completo}`, `{var1}`, `{var2}`, `{var3}`)
  - Multi-attachment support (images, videos, audio, documents)
  - Real-time preview functionality
- **State Management**: Reactive refs for message, attachments, modal states

### ContactList.vue
- **Purpose**: Advanced contact management with variable support
- **Features**:
  - Dynamic columns (Var 1, Var 2, Var 3 appear when data exists)
  - Multi-format import (TXT, CSV, XLSX)
  - Intelligent parser supporting multiple separators (`,`, `;`, `\t`, `|`)
  - Contact validation and status tracking
- **Dynamic Detection**: Computed properties `hasVar1`, `hasVar2`, `hasVar3`
- **Data Model**: `{ id, name, whatsapp, var1, var2, var3, status }`

### AppHeader.vue
- **Purpose**: Navigation and system configuration
- **Features**:
  - User dropdown with profile access
  - System settings panel (WhatsApp configuration)
  - Company management (multi-tenant support)
  - Dark mode toggle (style prepared)

## WhatsApp Integration

### UAZAPI
- **Current Status**: UI implemented, backend integration pending
- **Configuration**: Accessible through AppHeader settings panel
- **Features Prepared**:
  - Connection status display
  - Webhook configuration
  - API key management
  - QRC code generation for connection

### Message Variables
The system supports dynamic variable insertion:
- `{nome}` - Contact first name
- `{nome_completo}` - Contact full name
- `{var1}`, `{var2}`, `{var3}` - Custom contact variables
- Spintax format: `{option1|option2|option3}`

## Development Patterns

### Acesso à Documentação com MCP Context7
- **Vue 3**: Use Context7 para consultar Composition API, reatividade e componentes
- **Nuxt 4**: Documentação sobre file-based routing, layouts e middleware
- **TypeScript**: Tipagem avançada e configuração do projeto
- **Tailwind CSS**: Classes utilitárias e design system
- **Supabase**: Autenticação, database e storage APIs
- **xlsx**: Processamento de arquivos Excel e importação de dados

### Vue 3 Composition API
```javascript
// Reactive state
const contacts = ref([])
const isModalOpen = ref(false)

// Computed properties
const hasVar1 = computed(() => contacts.value.some(c => c.var1?.trim()))

// Methods
const handleImport = async () => {
  // Implementation
}
```

### Styling Patterns
- **Tailwind Classes**: Consistent use of design system
- **Color Scheme**: Blue primary (`#2563eb`), gray secondary
- **Component Styling**: Card-based layouts with consistent spacing
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### File Processing
- **XLSX Integration**: Uses `xlsx` library for Excel file processing
- **CSV/TXT Parsing**: Custom multi-separator parser
- **Validation**: WhatsApp number format validation

## State Management
- **Approach**: Local component state with Vue 3 reactivity
- **No Global Store**: Application uses local state management
- **Future Ready**: Architecture supports easy Pinia integration if needed

## Security Considerations
- **Environment Variables**: All sensitive data in `.env`
- **Validation**: Client-side validation with server-side ready patterns
- **Supabase Security**: RLS policies needed for production
- **WhatsApp API**: Secure webhook and API key management

## Future Development Opportunities
1. **Supabase Integration**: Replace hardcoded authentication
2. **Database Schema**: Create tables for contacts, campaigns, companies
3. **WhatsApp Backend**: Implement UAZAPI integration
4. **Campaign Analytics**: Message tracking and statistics
5. **File Upload**: Supabase Storage integration for media
6. **User Roles**: Implement company-based access control

## Testing and Validation
- **Manual Testing**: Current approach through development server
- **Contact Import**: Test with various file formats and separators
- **Spintax Generation**: Verify variable insertion functionality
- **Responsive Design**: Test across different screen sizes


