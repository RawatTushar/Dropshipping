const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const pkg = require("../../../package.json");

const options = {
definition: {
  openapi: "3.0.0",
  info: {
    title: `${pkg.name} API`,
    version: pkg.version,
    description: pkg.description || "",
  },

  servers: [
    {
      url: process.env.SWAGGER_BASE_URL ,
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
},
  apis: ["./src/features/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
console.log("Swagger Paths:", swaggerSpec.paths);
function mountSwagger(app) {
  app.use("/api/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = mountSwagger;
