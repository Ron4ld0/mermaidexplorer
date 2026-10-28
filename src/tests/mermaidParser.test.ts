import { describe, expect, it } from 'vitest';
import { parseMember, parseMermaidClassDiagram } from '../services/mermaidParser';

describe('mermaidParser', () => {
  it('should return error for empty input', () => {
    const result = parseMermaidClassDiagram('');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return error for code without classDiagram header and no classes', () => {
    const result = parseMermaidClassDiagram('sequenceDiagram\nAlice->>Bob: Hello');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Não foi encontrado um diagrama de classes válido');
  });

  it('should parse class members correctly', () => {
    const attr1 = parseMember('+name: string', 1);
    expect(attr1.memberType).toBe('attribute');
    expect(attr1.visibility).toBe('public');
    expect(attr1.name).toBe('name');
    expect(attr1.type).toBe('string');

    const attr2 = parseMember('-int age', 2);
    expect(attr2.memberType).toBe('attribute');
    expect(attr2.visibility).toBe('private');
    expect(attr2.name).toBe('age');
    expect(attr2.type).toBe('int');

    const method1 = parseMember('+calculateTotal(taxRate: float): decimal', 3);
    expect(method1.memberType).toBe('method');
    expect(method1.visibility).toBe('public');
    expect(method1.name).toBe('calculateTotal');
    expect(method1.parameters).toBe('taxRate: float');
    expect(method1.returnType).toBe('decimal');

    const staticAttr = parseMember('+$MAX_CAPACITY: int$', 4);
    expect(staticAttr.isStatic).toBe(true);
    expect(staticAttr.name).toBe('MAX_CAPACITY');
  });

  it('should parse block-style classes with stereotypes, attributes and methods', () => {
    const code = `classDiagram
      class PaymentGateway {
        <<interface>>
        +processPayment(amount: decimal): bool
        +refund(txId: string): bool
      }
    `;

    const result = parseMermaidClassDiagram(code);
    expect(result.success).toBe(true);
    expect(result.diagram).toBeDefined();

    const cls = result.diagram!.classes['PaymentGateway'];
    expect(cls).toBeDefined();
    expect(cls.stereotype).toBe('interface');
    expect(cls.methods.length).toBe(2);
    expect(cls.methods[0].name).toBe('processPayment');
  });

  it('should parse all UML relationship types with cardinalities and labels', () => {
    const code = `classDiagram
      User <|-- Customer : "especializa"
      Order "1" *-- "1..*" OrderItem : "composto de"
      Category "1" o-- "*" Product : "agrupa"
      Customer "1" --> "*" Order : "realiza"
      Order ..> NotificationService : "notifica"
      PaymentMethod <|.. CreditCard : "implementa"
      NodeA <--> NodeB : "bidirecional"
    `;

    const result = parseMermaidClassDiagram(code);
    expect(result.success).toBe(true);
    const relations = result.diagram!.relations;
    expect(relations.length).toBe(7);

    // Inheritance: User <|-- Customer
    const inheritance = relations.find((r) => r.type === 'inheritance');
    expect(inheritance).toBeDefined();
    expect(inheritance?.source).toBe('Customer');
    expect(inheritance?.target).toBe('User');

    // Composition: Order "1" *-- "1..*" OrderItem
    const composition = relations.find((r) => r.type === 'composition');
    expect(composition).toBeDefined();
    expect(composition?.source).toBe('Order');
    expect(composition?.target).toBe('OrderItem');
    expect(composition?.sourceCardinality).toBe('1');
    expect(composition?.targetCardinality).toBe('1..*');

    // Aggregation: Category "1" o-- "*" Product
    const aggregation = relations.find((r) => r.type === 'aggregation');
    expect(aggregation).toBeDefined();
    expect(aggregation?.type).toBe('aggregation');

    // Realization: PaymentMethod <|.. CreditCard
    const realization = relations.find((r) => r.type === 'realization');
    expect(realization).toBeDefined();
    expect(realization?.source).toBe('CreditCard');
    expect(realization?.target).toBe('PaymentMethod');

    // Dependency: Order ..> NotificationService
    const dependency = relations.find((r) => r.type === 'dependency');
    expect(dependency).toBeDefined();
    expect(dependency?.type).toBe('dependency');
  });

  it('should parse classes with :::classDef style annotation and attributes', () => {
    const code = `classDiagram
      class BaseEntity:::entity {
        <<abstract>>
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
      }
      class Job:::entity {
        -UUID id
        -Map~String, Object~ actionConfig
        -List~String~ reasons
        +calculateFinalFit() Integer
      }
      class JobStatus:::entity {
        <<Enumeration>>
        DRAFT
        APPROVAL
      }
      classDef entity fill:#FFE86D,stroke:#A28E26
    `;

    const result = parseMermaidClassDiagram(code);
    expect(result.success).toBe(true);
    const baseEntity = result.diagram!.classes['BaseEntity'];
    expect(baseEntity).toBeDefined();
    expect(baseEntity.stereotype).toBe('abstract');
    expect(baseEntity.attributes.length).toBe(2);
    expect(baseEntity.attributes[0].name).toBe('createdAt');
    expect(baseEntity.attributes[0].type).toBe('LocalDateTime');

    const job = result.diagram!.classes['Job'];
    expect(job).toBeDefined();
    expect(job.attributes.length).toBe(3);
    expect(job.attributes[1].name).toBe('actionConfig');
    expect(job.attributes[1].type).toBe('Map~String, Object~');
    expect(job.methods.length).toBe(1);
    expect(job.methods[0].name).toBe('calculateFinalFit');

    const jobStatus = result.diagram!.classes['JobStatus'];
    expect(jobStatus).toBeDefined();
    expect(jobStatus.stereotype?.toLowerCase()).toContain('enum');
    expect(jobStatus.attributes.length).toBe(2);
    expect(jobStatus.attributes[0].name).toBe('DRAFT');
  });

  it('should parse complete recruitment ATS diagram with 25 classes and notes', () => {
    const code = `classDiagram
    direction TB
    BaseEntity <|-- AuditableEntity
    AuditableEntity <|-- Company
    AuditableEntity <|-- Job
    Job "1" *-- "0..*" Automation : runs automation rules
    Job "1" *-- "0..*" JobSkill : defines requirements
    Candidate "1" *-- "0..*" Application : submits
    Job ..> JobStatus : status

    class BaseEntity:::entity {
        <<abstract>>
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
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
    class JobStatus:::entity {
        <<Enumeration>>
        DRAFT
        APPROVAL
        OPEN
        PAUSED
        CLOSED
    }

    note for Job "location: Cidade - UF, nulo para vagas remotas."
    classDef entity fill:#FFE86D,stroke:#A28E26,color:#574900
    `;

    const result = parseMermaidClassDiagram(code);
    expect(result.success).toBe(true);
    expect(result.diagram).toBeDefined();

    const job = result.diagram!.classes['Job'];
    expect(job.attributes.length).toBe(11);
    expect(job.methods.length).toBe(2);
    expect(job.methods[0].name).toBe('getId');
    expect(job.methods[0].returnType).toBe('UUID');
    expect(job.notes).toBeDefined();
    expect(job.notes![0]).toContain('location: Cidade - UF');

    const candidate = result.diagram!.classes['Candidate'];
    expect(candidate.attributes.length).toBe(7);
    expect(candidate.methods.length).toBe(3);

    const jobStatus = result.diagram!.classes['JobStatus'];
    expect(jobStatus.attributes.length).toBe(5);
  });
});
