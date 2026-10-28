export interface SampleDiagram {
  id: string;
  name: string;
  description: string;
  classCount: number;
  code: string;
}

export const SAMPLE_DIAGRAMS: SampleDiagram[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Enterprise Architecture',
    description: 'Sistema completo com herança, interfaces, composição, agregação, atributos, métodos e cardinalidades (15 classes).',
    classCount: 15,
    code: `classDiagram
    direction TB

    class User {
        <<abstract>>
        #id: UUID
        #name: string
        #email: string
        #createdAt: DateTime
        +login(credentials: AuthToken): bool
        +logout(): void
        +updateProfile(data: UserDTO): bool
    }

    class Customer {
        -loyaltyPoints: int
        -shippingAddress: Address
        -billingAddress: Address
        +getLoyaltyTier(): string
        +applyDiscount(code: string): float
        +listOrderHistory(): Order[]
    }

    class Admin {
        -roleLevel: int
        -permissions: string[]
        +grantRole(userId: UUID, role: string): void
        +revokeRole(userId: UUID, role: string): void
        +viewAuditLogs(): AuditLog[]
    }

    class Order {
        +orderNumber: string
        +status: OrderStatus
        +totalAmount: decimal
        +discountAmount: decimal
        +placedAt: DateTime
        +calculateTotal(): decimal
        +cancel(reason: string): bool
        +markShipped(trackingCode: string): void
    }

    class OrderItem {
        -quantity: int
        -unitPrice: decimal
        -subtotal: decimal
        +calculateSubtotal(): decimal
        +applyTaxRate(rate: float): decimal
    }

    class Product {
        +sku: string
        +name: string
        +description: string
        +basePrice: decimal
        +isAvailable: bool
        +checkStock(qty: int): bool
        +reserveStock(qty: int): bool
    }

    class ProductVariant {
        +variantId: string
        +color: string
        +size: string
        +stockQuantity: int
        +priceDelta: decimal
        +isInStock(): bool
    }

    class Category {
        +categoryId: string
        +title: string
        +slug: string
        +getProducts(): Product[]
    }

    class PaymentMethod {
        <<interface>>
        +authorize(amount: decimal): bool
        +capture(transactionId: string): Receipt
        +refund(transactionId: string, amount: decimal): bool
    }

    class CreditCardPayment {
        -cardNumberMasked: string
        -expiryDate: string
        -gatewayToken: string
        +authorize(amount: decimal): bool
        +capture(transactionId: string): Receipt
    }

    class PixPayment {
        -pixKey: string
        -qrCodePayload: string
        -expiresInMinutes: int
        +generateQrCode(): string
        +checkStatus(): bool
    }

    class PayPalPayment {
        -payerEmail: string
        -billingAgreementId: string
        +authorize(amount: decimal): bool
    }

    class OrderStatus {
        <<enumeration>>
        PENDING
        PROCESSING
        PAID
        SHIPPED
        DELIVERED
        CANCELLED
    }

    class NotificationService {
        <<service>>
        -smtpHost: string
        -smsApiKey: string
        +sendEmail(to: string, subject: string, body: string): void
        +sendSms(phone: string, text: string): void
        +sendOrderConfirmation(order: Order): void
    }

    class AuditLog {
        +eventTimestamp: DateTime
        +performedBy: string
        +action: string
        +details: JsonObject
        +exportCsv(): string
    }

    %% Relacionamentos e Herança
    User <|-- Customer : "especializa"
    User <|-- Admin : "especializa"

    %% Realizações de Interface
    PaymentMethod <|.. CreditCardPayment : "implementa"
    PaymentMethod <|.. PixPayment : "implementa"
    PaymentMethod <|.. PayPalPayment : "implementa"

    %% Composição (Order possui OrderItems, Product possui ProductVariants)
    Order "1" *-- "1..*" OrderItem : "composto por"
    Product "1" *-- "*" ProductVariant : "contém variantes"

    %% Agregação (Category agrega Products, Order agrega PaymentMethod)
    Category "1" o-- "*" Product : "categoriza"
    Order "1" o-- "1" PaymentMethod : "pago com"

    %% Associações Diretas
    Customer "1" --> "*" Order : "realiza pedidos"
    OrderItem "*" --> "1" Product : "referencia produto"
    Order "1" --> "1" OrderStatus : "possui status"

    %% Dependências de Serviços
    Order ..> NotificationService : "dispara notificação"
    Admin ..> AuditLog : "audita ações"
`,
  },
  {
    id: 'banking',
    name: 'Core Banking & Fintech',
    description: 'Arquitetura bancária com contas, transações, autorizações, empréstimos e cartões (11 classes).',
    classCount: 11,
    code: `classDiagram
    direction LR

    class Account {
        <<abstract>>
        #accountNumber: string
        #balance: decimal
        #currency: Currency
        +deposit(amount: decimal): bool
        +withdraw(amount: decimal): bool
        +getBalance(): decimal
    }

    class CheckingAccount {
        -overdraftLimit: decimal
        -monthlyFee: decimal
        +applyOverdraft(amount: decimal): void
    }

    class SavingsAccount {
        -interestRate: float
        -compoundingPeriod: string
        +accrueInterest(): decimal
    }

    class Transaction {
        +txId: UUID
        +amount: decimal
        +timestamp: DateTime
        +type: string
        +execute(): bool
        +rollback(): bool
    }

    class Card {
        <<abstract>>
        #cardNumber: string
        #cvv: string
        #expirationDate: string
        +validatePin(pin: string): bool
    }

    class DebitCard {
        -dailyWithdrawalLimit: decimal
        +charge(amount: decimal): bool
    }

    class CreditCard {
        -creditLimit: decimal
        -availableCredit: decimal
        +requestLimitIncrease(newLimit: decimal): bool
    }

    class BankCustomer {
        +taxId: string
        +fullName: string
        +kycStatus: string
        +getAccounts(): Account[]
    }

    class FraudEngine {
        <<service>>
        -riskThreshold: float
        +evaluateRisk(tx: Transaction): float
        +flagSuspicious(tx: Transaction): void
    }

    class Loan {
        +principal: decimal
        +termMonths: int
        +interestRate: float
        +calculateMonthlyPayment(): decimal
    }

    class Currency {
        <<enumeration>>
        BRL
        USD
        EUR
    }

    Account <|-- CheckingAccount
    Account <|-- SavingsAccount
    Card <|-- DebitCard
    Card <|-- CreditCard

    BankCustomer "1" --> "*" Account : "titular"
    BankCustomer "1" --> "*" Card : "possui"
    Account "1" *-- "*" Transaction : "registra extrato"
    CheckingAccount "1" o-- "0..1" DebitCard : "vinculado a"
    BankCustomer "1" --> "*" Loan : "solicita empréstimo"
    Transaction ..> FraudEngine : "submete à análise de fraude"
`,
  },
  {
    id: 'quickstart',
    name: 'Quickstart MVP Model',
    description: 'Exemplo compacto de biblioteca para teste rápido inicial (5 classes).',
    classCount: 5,
    code: `classDiagram
    class Book {
        +isbn: string
        +title: string
        +author: string
        +isAvailable: bool
        +checkout(): bool
        +returnBook(): void
    }

    class Member {
        +memberId: string
        +name: string
        +maxAllowedLoans: int
        +borrow(book: Book): bool
    }

    class LoanRecord {
        +loanDate: Date
        +dueDate: Date
        +isReturned: bool
    }

    class LibraryCatalog {
        +searchByTitle(title: string): Book[]
        +registerBook(book: Book): void
    }

    class NotificationManager {
        <<service>>
        +notifyDueSoon(member: Member): void
    }

    Member "1" --> "*" LoanRecord : "possui histórico"
    LoanRecord "*" --> "1" Book : "empresta"
    LibraryCatalog "1" o-- "*" Book : "organiza acervo"
    LoanRecord ..> NotificationManager : "avisa atraso"
`,
  },
  {
    id: 'recruitment-ats',
    name: 'ATS Plataforma de Recrutamento',
    description: 'Diagrama com 25 classes (vagas, candidatos, etapas Kanban, automações, testes e formulários) com notas e herança profunda.',
    classCount: 25,
    code: `classDiagram
    direction TB
    BaseEntity <|-- AuditableEntity
    AuditableEntity <|-- Company
    AuditableEntity <|-- Job
    AuditableEntity <|-- JobStage
    AuditableEntity <|-- JobSkill
    AuditableEntity <|-- Skill
    AuditableEntity <|-- SkillGroup
    AuditableEntity <|-- Automation
    AuditableEntity <|-- Interview
    AuditableEntity <|-- FormQuestion
    AuditableEntity <|-- Application
    AuditableEntity <|-- Candidate
    AuditableEntity <|-- User
    BaseEntity <|-- ScreeningResult
    BaseEntity <|-- FormQuestionOption
    BaseEntity <|-- FormAnswer
    BaseEntity <|-- SkillGroupItem

    Job "1" *-- "0..*" Automation : runs automation rules
    Job "1" *-- "0..*" JobSkill : defines requirements
    JobSkill "0..*" --> "1" Skill : uses skill
    SkillGroup "1" *-- "0..*" SkillGroupItem : groups skills
    SkillGroupItem "0..*" --> "1" Skill : references skill
    Job "1" *-- "1..*" JobStage : has stages (Kanban)
    Job "1" *-- "0..*" Application : receives
    Candidate "1" *-- "0..*" Application : submits
    Application "0..*" --> "1" JobStage : current_stage
    Application "1" *-- "0..*" Interview : schedules
    Application "1" *-- "0..1" ScreeningResult : scored_by (AI)
    Job "1" *-- "0..*" FormQuestion : configures application form
    FormQuestion "1" *-- "0..*" FormQuestionOption : has options
    Application "1" *-- "0..*" FormAnswer : answers
    FormAnswer "0..*" --> "1" FormQuestion : answers question
    FormAnswer "0..*" --> "0..1" FormQuestionOption : selected option

    Job ..> JobStatus : status
    Job ..> WorkMode : workMode
    Skill ..> SkillType : type
    User ..> UserRole : role
    Automation ..> AutomationTrigger : trigger
    Application ..> ApplicationStatus : status
    FormQuestion ..> QuestionType : type

    class BaseEntity:::entity {
        <<abstract>>
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
    }
    class AuditableEntity:::entity {
        <<abstract>>
        -UUID createdBy
    }
    class Company:::entity {
        -UUID id
        -String name
        -String cnpj
        -String slug
        -Boolean active
    }
    class User:::entity {
        -UUID id
        -UUID companyId
        -String name
        -String email
        -String passwordHash
        -UserRole role
        -Boolean active
    }
    class Job:::entity {
        -UUID id
        -UUID companyId
        -String title
        -String description
        -BigDecimal salaryMin
        -BigDecimal salaryMax
        -JobStatus status
        -WorkMode workMode
        -String location
        -Integer weeklyHours
        -Boolean requestGithub
        +getId() UUID
        +getTitle() String
    }
    class JobStage:::entity {
        -UUID id
        -UUID jobId
        -String name
        -Integer position
        +getId() UUID
        +getName() String
        +getPosition() Integer
    }
    class Candidate:::entity {
        -UUID id
        -String name
        -String email
        -String phone
        -String resumeUrl
        -String linkedinUrl
        -String githubUrl
        +getId() UUID
        +getName() String
        +getEmail() String
    }
    class Application:::entity {
        -UUID id
        -Job job
        -Candidate candidate
        -JobStage currentStage
        -BigDecimal salaryExpectation
        -ApplicationStatus status
        -LocalDateTime appliedAt
        +getId() UUID
        +moveToStage(JobStage nextStage)
        +setStatus(ApplicationStatus status)
    }
    class JobSkill:::entity {
        -UUID id
        -UUID jobId
        -UUID skillId
        -Integer weight
    }
    class Skill:::entity {
        -UUID id
        -UUID companyId
        -String name
        -SkillType type
        -Integer weight
        -Boolean active
    }
    class SkillGroup:::entity {
        -UUID id
        -UUID companyId
        -String name
    }
    class SkillGroupItem:::entity {
        -UUID skillGroupId
        -UUID skillId
    }
    class ScreeningResult:::entity {
        -UUID id
        -Application application
        -Integer cvScore
        -Integer formScore
        -Boolean salaryWithinRange
        -Integer scoreFitAI
        -List~String~ reasons
        -LocalDateTime scoredAt
        +calculateFinalFit() Integer
        +getScoreFitAI() Integer
    }
    class Automation:::entity {
        -UUID id
        -Job job
        -AutomationTrigger trigger
        -Map~String, Object~ actionConfig
        -Integer delayMinutes
        +executeAction(Application app)
    }
    class Interview:::entity {
        -UUID id
        -Application application
        -LocalDateTime scheduledAt
        -String meetingUrl
        -Map~String, Object~ scorecard
        -String transcriptionText
        -String aiSummary
        +evaluateScorecard()
    }
    class FormQuestion:::entity {
        -UUID id
        -UUID jobId
        -String text
        -QuestionType type
        -Boolean required
        -Integer position
    }
    class FormQuestionOption:::entity {
        -UUID id
        -UUID questionId
        -String label
        -Integer position
        -Boolean eliminatory
    }
    class FormAnswer:::entity {
        -UUID id
        -UUID applicationId
        -UUID questionId
        -String textAnswer
        -UUID selectedOptionId
    }
    class JobStatus:::entity {
        <<Enumeration>>
        DRAFT
        APPROVAL
        OPEN
        PAUSED
        CLOSED
    }
    class WorkMode:::entity {
        <<Enumeration>>
        ONSITE
        HYBRID
        REMOTE
    }
    class SkillType:::entity {
        <<Enumeration>>
        HARD
        SOFT
    }
    class UserRole:::entity {
        <<Enumeration>>
        RECRUITER
        COMPANY_ADMIN
        SYSTEM_ADMIN
        EVALUATOR
    }
    class AutomationTrigger:::entity {
        <<Enumeration>>
        TALENT_ADDED
        ELIMINATORY_FORM_OK
        TEST_CUTOFF_SCORE_REACHED
        STAGE_CHANGED
    }
    class ApplicationStatus:::entity {
        <<Enumeration>>
        ACTIVE
        REJECTED
        WITHDRAWN
        HIRED
    }
    class QuestionType:::entity {
        <<Enumeration>>
        MULTIPLE_CHOICE
        TEXT
    }

    note for AuditableEntity "createdBy é opcional em Application e Candidate (nulo = criado pelo próprio candidato)."
    note for AuditableEntity "createdBy referencia User.id."
    note for Company "Cliente da plataforma, criado pelo SYSTEM_ADMIN. cnpj e slug: únicos. slug identifica a página pública de carreiras."
    note for Company "companyId em User, Job, Skill e SkillGroup referencia Company.id. Em User, é nulo apenas para SYSTEM_ADMIN."
    note for User "email: único. companyId é nulo para SYSTEM_ADMIN (nível de plataforma). Candidatos e visitantes não têm login e não são usuários."
    note for User "Login via JWT. passwordHash guarda apenas o hash da senha, nunca a senha em texto. O token carrega userId, companyId e role."
    note for FormAnswer "textAnswer: perguntas TEXT / selectedOptionId: perguntas MULTIPLE_CHOICE (opção única)."
    note for Job "location: Cidade - UF, nulo para vagas remotas."
    note for Job "requestGithub: true para vagas de tecnologia. O frontend exibe e valida Candidate.githubUrl."
    note for ScreeningResult "salaryWithinRange: true se Application.salaryExpectation está dentro de Job.salaryMin e Job.salaryMax (nulo se não informado). Apenas informativo: não é usado em calculateFinalFit() e não impede a contratação."
    note for ScreeningResult "scoreFitAI: de 0 a 100, calculado por calculateFinalFit() a partir de cvScore e formScore. salaryWithinRange não entra no cálculo."
    note for Skill "Catálogo de habilidades da empresa, com CRUD para recrutadores. weight: de 1 a 10. active=false oculta a habilidade sem apagá-la."
    note for Skill "Único: companyId + name."
    note for JobSkill "Adicionar um grupo a uma vaga cria uma JobSkill para cada habilidade do grupo (cópia). Alterações posteriores no grupo não afetam vagas já criadas."
    note for JobSkill "Único: jobId + skillId. A mesma habilidade não pode entrar duas vezes na vaga, diretamente ou via grupo."
    note for SkillGroupItem "Chave primária: skillGroupId + skillId (composta). Sem id próprio."

    classDef entity fill:#FFE86D,stroke:#A28E26,color:#574900
`,
  },
];
