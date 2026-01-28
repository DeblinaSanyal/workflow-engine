# Complete Node Reference - 16 Nodes

Your workflow platform now includes **16 powerful nodes** across 5 categories!

## 📊 Node Overview

| Category | Nodes | Use Cases |
|----------|-------|-----------|
| **Actions** (7) | HTTP Request, OpenAI Chat, Claude AI, Send Email, Slack Message, Database Query | API calls, AI processing, notifications, data queries |
| **Transform** (3) | Data Transform, Sentiment Analysis, CSV Parser | Data manipulation, AI analysis, file processing |
| **Control** (2) | If Condition, JSON Validator | Flow control, validation |
| **Integration** (4) | SAP RFC Call, SAP BAPI, SAP Table Read, SAP OData | Enterprise SAP integration |

---

## 🔷 SAP Integration Nodes

### 1. SAP RFC Call
**Execute SAP Remote Function Calls**

```
Icon: 🔷
Category: Integration
```

**Parameters:**
- **SAP Host** - SAP system hostname (e.g., `sap.company.com`)
- **Client** - SAP client number (e.g., `100`)
- **RFC Function Name** - RFC to call (e.g., `RFC_READ_TABLE`)
- **RFC Parameters** - JSON input parameters
- **Username** - SAP username
- **Password** - SAP password (credentials)

**Use Cases:**
- Read SAP master data
- Execute custom RFCs
- Trigger SAP processes
- Data synchronization

**Example:**
```javascript
// Input parameters
{
  "QUERY_TABLE": "MARA",
  "DELIMITER": ";",
  "ROWCOUNT": 100
}

// Output
{
  "rfcName": "RFC_READ_TABLE",
  "status": "SUCCESS",
  "results": {
    "tables": [...],
    "returnCode": 0
  }
}
```

---

### 2. SAP BAPI Execute
**Execute SAP Business APIs**

```
Icon: 🔹
Category: Integration
```

**Parameters:**
- **BAPI Name** - BAPI to execute (e.g., `BAPI_SALESORDER_CREATEFROMDAT2`)
- **Method** - CREATE, UPDATE, READ, DELETE
- **Business Object** - SAP object type (e.g., `SalesOrder`)
- **Input Data** - BAPI input structure (JSON)
- **Auto Commit** - Automatically commit transaction

**Use Cases:**
- Create sales orders
- Update customer master
- Process business documents
- Execute complex business logic

**Example:**
```javascript
// Create sales order
{
  "ORDER_HEADER_IN": {
    "DOC_TYPE": "OR",
    "SALES_ORG": "1000"
  },
  "ORDER_ITEMS_IN": [
    {
      "MATERIAL": "MAT001",
      "TARGET_QTY": "10"
    }
  ]
}
```

---

### 3. SAP Table Read
**Read data from SAP tables**

```
Icon: 📊
Category: Integration
```

**Parameters:**
- **Table Name** - SAP table (e.g., `MARA`, `KNA1`)
- **Fields to Select** - Comma-separated fields
- **WHERE Clause** - SAP WHERE condition
- **Max Rows** - Result limit

**Use Cases:**
- Extract material master
- Query customer data
- Read pricing conditions
- Data analysis

**Example:**
```javascript
// Query
Table: MARA
Fields: MATNR, MAKTX, MEINS
WHERE: MATNR LIKE 'MAT%'
Max Rows: 100

// Output
{
  "tableName": "MARA",
  "rowCount": 45,
  "data": [...]
}
```

---

### 4. SAP OData Query
**Query SAP OData services**

```
Icon: 🌐
Category: Integration
```

**Parameters:**
- **Service URL** - OData endpoint
- **Entity Set** - Entity to query (e.g., `SalesOrderSet`)
- **$filter** - OData filter expression
- **$select** - Fields to return
- **$top** - Number of records
- **$expand** - Navigation properties

**Use Cases:**
- Cloud SAP integration
- Modern API access
- Real-time data queries
- Mobile app backends

**Example:**
```javascript
// Query
EntitySet: SalesOrderSet
$filter: Status eq 'OPEN'
$select: OrderID,CustomerName,Amount
$top: 50

// Returns
{
  "count": 23,
  "data": [
    {
      "OrderID": "ORDER-1001",
      "CustomerName": "ABC Corp",
      "Amount": "15000"
    }
  ]
}
```

---

## 🤖 AI / Agentic Nodes

### 5. OpenAI Chat
**Generate AI responses using GPT models**

```
Icon: 🤖
Category: Action
```

**Parameters:**
- **API Key** - OpenAI API key
- **Model** - GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Prompt** - Your question/instruction
- **System Message** - AI role/behavior
- **Temperature** - Creativity (0-2)
- **Max Tokens** - Response length

**Use Cases:**
- Content generation
- Customer support automation
- Data analysis and insights
- Code generation
- Document summarization

**Example:**
```javascript
// Prompt
"Analyze this customer feedback and extract sentiment, key issues, and recommendations"

// Output
{
  "model": "gpt-4",
  "response": "Based on the feedback...",
  "usage": {
    "total_tokens": 95
  }
}
```

---

### 6. Claude AI
**Anthropic's Claude for advanced reasoning**

```
Icon: 🧠
Category: Action
```

**Parameters:**
- **API Key** - Anthropic API key
- **Model** - Claude 3.5 Sonnet, Opus, Haiku
- **Prompt** - Your instruction
- **System Prompt** - Instructions for Claude
- **Max Tokens** - Response length
- **Temperature** - Creativity (0-1)

**Use Cases:**
- Complex analysis
- Code review and generation
- Technical documentation
- Business strategy
- Long-form content

**Example:**
```javascript
// System Prompt
"You are an expert business analyst specializing in process optimization"

// Prompt
"Analyze this SAP workflow and suggest improvements"

// Output
{
  "response": "Your workflow shows...",
  "usage": {
    "input_tokens": 45,
    "output_tokens": 85
  }
}
```

---

### 7. Sentiment Analysis
**Analyze text sentiment and emotions**

```
Icon: 😊
Category: Transform
```

**Parameters:**
- **Text to Analyze** - Input text
- **Include Emotions** - Detect specific emotions
- **Language** - English, German, Spanish, French

**Use Cases:**
- Customer feedback analysis
- Social media monitoring
- Support ticket prioritization
- Brand sentiment tracking

**Example:**
```javascript
// Input
"I absolutely love this product! It works perfectly."

// Output
{
  "sentiment": "positive",
  "score": 0.8,
  "confidence": 0.85,
  "emotions": {
    "joy": 0.8,
    "anger": 0.1
  }
}
```

---

## 📧 Communication Nodes

### 8. Send Email
**Send emails via SMTP**

```
Icon: 📧
Category: Action
```

**Parameters:**
- **To** - Recipient email
- **Subject** - Email subject
- **Body** - Email content
- **CC** - Carbon copy recipients
- **BCC** - Blind carbon copy
- **HTML Email** - Send as HTML
- **Attachments** - File attachments (JSON)

**Use Cases:**
- Workflow notifications
- Report distribution
- Alerts and warnings
- Customer communication

---

### 9. Slack Message
**Send messages to Slack channels**

```
Icon: 💬
Category: Action
```

**Parameters:**
- **Webhook URL** - Slack webhook
- **Channel** - Channel name (e.g., `#general`)
- **Message** - Text to send
- **Bot Username** - Display name
- **Icon Emoji** - Bot icon
- **Attachments** - Rich message attachments

**Use Cases:**
- Team notifications
- Workflow status updates
- Error alerts
- Daily reports

---

## 🗄️ Data Processing Nodes

### 10. Database Query
**Execute SQL queries**

```
Icon: 🗄️
Category: Action
```

**Parameters:**
- **Connection String** - Database connection
- **Database Type** - PostgreSQL, MySQL, SQL Server, Oracle, SAP HANA
- **SQL Query** - Query to execute
- **Query Parameters** - Parameterized values
- **Timeout** - Query timeout (seconds)

**Use Cases:**
- Data extraction
- Report generation
- Data validation
- Complex joins and aggregations

---

### 11. CSV Parser
**Parse CSV into JSON**

```
Icon: 📄
Category: Transform
```

**Parameters:**
- **CSV Data** - CSV content
- **Delimiter** - Comma, semicolon, tab, pipe
- **Has Header Row** - First row is headers
- **Skip Empty Lines** - Ignore empty rows

**Use Cases:**
- Import CSV files
- Data transformation
- Batch processing
- File uploads

**Example:**
```javascript
// Input CSV
name,email,age
John,john@example.com,30
Jane,jane@example.com,28

// Output
{
  "rowCount": 2,
  "columnCount": 3,
  "headers": ["name", "email", "age"],
  "data": [
    {"name": "John", "email": "john@example.com", "age": "30"},
    {"name": "Jane", "email": "jane@example.com", "age": "28"}
  ]
}
```

---

### 12. JSON Schema Validator
**Validate JSON against schema**

```
Icon: ✅
Category: Transform
```

**Parameters:**
- **JSON Data** - Data to validate
- **JSON Schema** - Validation schema
- **Strict Mode** - Reject additional properties

**Outputs:**
- **Valid** - Data passed validation
- **Invalid** - Data failed validation

**Use Cases:**
- Input validation
- API contract enforcement
- Data quality checks
- Error handling

---

## 🔄 Core Utility Nodes

### 13. HTTP Request
**Make HTTP API calls**

```
Icon: 🌐
Category: Action
```

**Parameters:**
- **Method** - GET, POST, PUT, PATCH, DELETE
- **URL** - API endpoint
- **Headers** - Request headers (JSON)
- **Body** - Request body (JSON)
- **Timeout** - Request timeout (ms)

---

### 14. Data Transform
**Transform data with JavaScript**

```
Icon: 🔄
Category: Transform
```

**Parameters:**
- **JavaScript Code** - Transformation logic

**Example:**
```javascript
// Extract and calculate
return {
  customerName: input.body.name,
  totalAmount: input.items.reduce((sum, item) => sum + item.price, 0),
  itemCount: input.items.length
}
```

---

### 15. If Condition
**Conditional workflow routing**

```
Icon: 🔀
Category: Control
```

**Parameters:**
- **Condition** - JavaScript boolean expression

**Outputs:**
- **True** - Condition met
- **False** - Condition not met

**Example:**
```javascript
// Conditions
input.amount > 1000
input.status === 'approved' && input.credits > 0
input.email && input.email.includes('@company.com')
```

---

## 🎯 Workflow Patterns

### Pattern 1: SAP Data to AI Analysis
```
SAP Table Read
    ↓
Data Transform (format)
    ↓
Claude AI (analyze)
    ↓
Send Email (report)
```

### Pattern 2: Intelligent Routing
```
HTTP Request (get data)
    ↓
Sentiment Analysis
    ↓
If Condition (check sentiment)
    ├─ Positive → Slack Message (celebrate)
    └─ Negative → Send Email (alert)
```

### Pattern 3: Data Pipeline
```
CSV Parser
    ↓
JSON Validator
    ↓
If Condition (valid?)
    ├─ Valid → Database Query (insert)
    └─ Invalid → Send Email (error report)
```

### Pattern 4: Agentic Workflow
```
HTTP Request (fetch data)
    ↓
OpenAI Chat (analyze & decide)
    ↓
Data Transform (extract decision)
    ↓
SAP BAPI Execute (take action)
    ↓
Slack Message (notify team)
```

---

## 🚀 Next Steps

1. **Explore Nodes**: Try each node type
2. **Build Patterns**: Combine nodes for complex workflows
3. **Add Custom Nodes**: Extend with your own logic (see README.md)
4. **Production Setup**: Add real API keys and connections

---

## 💡 Tips

- **Mock Mode**: All nodes return mock data by default - perfect for testing!
- **Production**: Replace mock implementations with real API calls
- **Error Handling**: All nodes include proper error handling
- **Logging**: Check backend console for execution logs
- **Validation**: Nodes validate parameters automatically

Ready to build powerful automation workflows! 🎉
