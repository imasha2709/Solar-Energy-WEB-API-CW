import { OpenAPIV3 } from "openapi-types";

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",

  info: {
    title: "SLSEA Real-Time Solar Generation Data API",
    version: "1.0.0",
    description:
      "REST API for managing and accessing real-time solar generation data for the Sri Lanka Sustainable Energy Authority (SLSEA).",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Authentication",
      description: "Authentication endpoints",
    },
    {
      name: "Provinces",
      description: "Province resources",
    },
    {
      name: "Districts",
      description: "District resources",
    },
    {
      name: "Substations",
      description: "Grid substation resources",
    },
    {
      name: "Installations",
      description: "Solar installation resources",
    },
    {
      name: "Generation Readings",
      description: "Solar generation reading resources",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Enter a valid JWT access token.",
      },
    },

    schemas: {
      Error: {
        type: "object",
        required: ["code", "message", "detail"],
        properties: {
          code: {
            type: "string",
            example: "RESOURCE_NOT_FOUND",
          },
          message: {
            type: "string",
            example: "Resource not found.",
          },
          detail: {
            type: "string",
            example: "No installation exists with ID 1.",
          },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "national@slsea.gov.lk",
          },
          password: {
            type: "string",
            format: "password",
            example: "Password123!",
          },
        },
      },

      LoginResponse: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIs...",
          },
          tokenType: {
            type: "string",
            example: "Bearer",
          },
          expiresIn: {
            type: "string",
            example: "1h",
          },
          scope: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["analyst-read"],
          },
        },
      },

      Province: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Western",
          },
          code: {
            type: "string",
            example: "WP",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      District: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Colombo",
          },
          code: {
            type: "string",
            example: "CMB",
          },
          provinceId: {
            type: "integer",
            example: 1,
          },
        },
      },

      GridSubstation: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Colombo Grid Substation 1",
          },
          code: {
            type: "string",
            example: "CMB-GS-001",
          },
          districtId: {
            type: "integer",
            example: 1,
          },
        },
      },

      SolarInstallation: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Solar Installation 1",
          },
          meterId: {
            type: "string",
            example: "METER-0001",
          },
          inverterId: {
            type: "string",
            nullable: true,
            example: "INV-0001",
          },
          capacityKw: {
            type: "number",
            example: 250.5,
          },
          latitude: {
            type: "number",
            example: 6.9271,
          },
          longitude: {
            type: "number",
            example: 79.8612,
          },
          active: {
            type: "boolean",
            example: true,
          },
          substationId: {
            type: "integer",
            example: 1,
          },
        },
      },

      GenerationReading: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "1001",
          },
          installationId: {
            type: "integer",
            example: 1,
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2026-10-07T10:00:00.000Z",
          },
          powerKw: {
            type: "number",
            example: 185.42,
          },
          cumulativeKwh: {
            type: "number",
            example: 12540.75,
          },
          voltage: {
            type: "number",
            example: 230.5,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      GenerationReadingInput: {
        type: "object",
        required: [
          "timestamp",
          "powerKw",
          "cumulativeKwh",
          "voltage",
        ],
        properties: {
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2026-10-07T10:00:00.000Z",
          },
          powerKw: {
            type: "number",
            minimum: 0,
            example: 185.42,
          },
          cumulativeKwh: {
            type: "number",
            minimum: 0,
            example: 12540.75,
          },
          voltage: {
            type: "number",
            minimum: 0,
            example: 230.5,
          },
        },
      },
    },
  },

  paths: {
    "/health": {
      get: {
        tags: ["Authentication"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API is running",
          },
        },
      },
    },

    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login",
        description:
          "Authenticate a user and receive a JWT access token.",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },
              },
            },
          },

          "400": {
            description: "Missing credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },

          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/provinces": {
      get: {
        tags: ["Provinces"],
        summary: "Get provinces",
        security: [{ bearerAuth: [] }],

        responses: {
          "200": {
            description: "List of provinces",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Province",
                  },
                },
              },
            },
          },

          "401": {
            description: "Authentication required",
          },

          "403": {
            description: "Insufficient scope",
          },
        },
      },
    },

    "/api/v1/provinces/{provinceId}": {
      get: {
        tags: ["Provinces"],
        summary: "Get a province",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "provinceId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],

        responses: {
          "200": {
            description: "Province found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Province",
                },
              },
            },
          },

          "403": {
            description: "Jurisdiction access denied",
          },

          "404": {
            description: "Province not found",
          },
        },
      },
    },

    "/api/v1/provinces/{provinceId}/districts": {
      get: {
        tags: ["Provinces"],
        summary: "Get districts in a province",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "provinceId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],

        responses: {
          "200": {
            description: "Districts in the province",
          },

          "403": {
            description: "Jurisdiction access denied",
          },

          "404": {
            description: "Province not found",
          },
        },
      },
    },

    "/api/v1/districts/{districtId}": {
      get: {
        tags: ["Districts"],
        summary: "Get a district",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "districtId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],

        responses: {
          "200": {
            description: "District found",
          },

          "403": {
            description: "Jurisdiction access denied",
          },

          "404": {
            description: "District not found",
          },
        },
      },
    },

    "/api/v1/districts/{districtId}/substations": {
      get: {
        tags: ["Districts"],
        summary: "Get substations in a district",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "districtId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],

        responses: {
          "200": {
            description: "Substations in the district",
          },

          "403": {
            description: "Jurisdiction access denied",
          },
        },
      },
    },

    "/api/v1/substations/{substationId}": {
      get: {
        tags: ["Substations"],
        summary: "Get a substation",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "substationId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],

        responses: {
          "200": {
            description: "Substation found",
          },

          "403": {
            description: "Jurisdiction access denied",
          },

          "404": {
            description: "Substation not found",
          },
        },
      },
    },

    "/api/v1/substations/{substationId}/installations": {
      get: {
        tags: ["Substations"],
        summary: "Get installations at a substation",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "substationId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],

        responses: {
          "200": {
            description: "Installations at the substation",
          },

          "403": {
            description: "Jurisdiction access denied",
          },
        },
      },
    },

    "/api/v1/districts/{districtId}/generation-summary": {
  get: {
    tags: ["Districts"],
    summary: "Get district generation summary",
    description:
      "Returns a derived generation summary for a district.",

    security: [{ bearerAuth: [] }],

    parameters: [
      {
        name: "districtId",
        in: "path",
        required: true,
        schema: {
          type: "integer",
        },
        example: 1,
      },
    ],

    responses: {
      "200": {
        description: "District generation summary",
      },

      "400": {
        description: "Invalid district ID",
      },

      "401": {
        description: "Authentication required",
      },

      "403": {
        description: "Jurisdiction access denied",
      },

      "404": {
        description: "District not found",
      },
    },
  },
},

    "/api/v1/installations/{installationId}": {
      get: {
        tags: ["Installations"],
        summary: "Get a solar installation",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "installationId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],

        responses: {
          "200": {
            description: "Installation found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SolarInstallation",
                },
              },
            },
          },

          "403": {
            description: "Jurisdiction access denied",
          },

          "404": {
            description: "Installation not found",
          },
        },
      },
    },

    "/api/v1/installations/{installationId}/last-known-reading": {
      get: {
        tags: ["Generation Readings"],
        summary: "Get the last known reading",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "installationId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],

        responses: {
          "200": {
            description: "Last known generation reading",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GenerationReading",
                },
              },
            },
          },

          "403": {
            description: "Jurisdiction access denied",
          },

          "404": {
            description: "Reading or installation not found",
          },
        },
      },
    },

    "/api/v1/installations/{installationId}/readings": {
      get: {
        tags: ["Generation Readings"],
        summary: "Get generation reading history",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "installationId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
          {
            name: "order",
            in: "query",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
          },
          {
            name: "from",
            in: "query",
            schema: {
              type: "string",
              format: "date-time",
            },
          },
          {
            name: "to",
            in: "query",
            schema: {
              type: "string",
              format: "date-time",
            },
          },
          {
            name: "provinceId",
            in: "query",
            schema: {
              type: "integer",
            },
          },
          {
            name: "districtId",
            in: "query",
            schema: {
              type: "integer",
            },
          },
          {
            name: "substationId",
            in: "query",
            schema: {
              type: "integer",
            },
          },
        ],

        responses: {
          "200": {
            description: "Paginated generation history",
          },

          "304": {
            description: "Not modified",
          },

          "400": {
            description: "Invalid query parameters",
          },

          "403": {
            description: "Jurisdiction access denied",
          },

          "404": {
            description: "Installation not found",
          },
        },
      },

      post: {
        tags: ["Generation Readings"],
        summary: "Create a generation reading",
        description:
          "Metering devices use this endpoint to append a new reading for their authorized installation.",

        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "installationId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/GenerationReadingInput",
              },
            },
          },
        },

        responses: {
          "201": {
            description: "Generation reading created",
            headers: {
              Location: {
                description:
                  "URL of the newly created reading resource",
                schema: {
                  type: "string",
                },
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GenerationReading",
                },
              },
            },
          },

          "400": {
            description: "Invalid reading",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },

          "401": {
            description: "Authentication required",
          },

          "403": {
            description: "Installation access denied",
          },

          "404": {
            description: "Installation not found",
          },

          "409": {
            description: "Duplicate reading",
          },
        },
      },
    },
  },
};