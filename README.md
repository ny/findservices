# Project Maslow

Project Maslow is an application that recommends social services to New York
State residents that they might be eligible for. The objective is to make it
easier for residents to discover and apply for relevant services such as
unemployment insurance, temporary assistance, and supplemental benefits for
housing, food, and energy.

## Motivation

As a result of the COVID-19 pandemic and its economic after-effects, many New
York State residents are seeking support from their government for the first
time. New York State provides so many services across many agencies that it can
be difficult to discover which services exist and how to apply for them. Our
research reveals that many residents struggle to know where to begin.

We believe that a concierge-like experience for residents that asks a few basic
questions and matches them with services they may be eligible for could help
more residents discover and successfully apply for helpful services.

## Project structure

Project Maslow has two applications: Maslow Access and Maslow Author.

- **Maslow Access** is the resident-facing application that recommends social
  services
- **Maslow Author** is the internal-facing application that allows content managers
  to configure the social services that Maslow Access can recommend.

These two applications are run independently and deployed to distinct
environments. Because these two applications share code, we are using both
[Maven modules] and [Yarn workspaces] to share code between two full-stack
applications.

The repository has the following top-level structure:

```
.
├── client
│   ├── access
│   ├── author
│   └── shared
└── server
    ├── access
    ├── author
    └── shared
```

The `client` and `server` folders contain the client code (written in Javascript
using React) and the server code (written in Java using Spring Boot)
respectively. Under each folder, there are three folders:

- `access` contains the executable code specific to the access app
- `author` contains the executable code specific to the author app
- `shared` contains the library code shared between `access` and `author`

## Requirements

Building either of the Maslow Access or Maslow Author applications requires:

- Java 8 JDK
- Maven
- Node v14
- Yarn

Running the Maslow Access application requires:

- Java 8 JRE

Running the Maslow Author application requires:

- MongoDB
- Java 8 JRE

For development, we also recommend:

- Docker. Though not strictly required, it is the easiest way to host your
  development instance of MongoDB.
- Visual Studio Code. The project contains instructions and configuration to
  ease development with this particular IDE.

## Installation

To get the source code:

```sh
git clone https://github.com/ny/findservices.git
```

### Production

During **production**, the Maslow Access application has one process:

- **server** and **client**: Spring Boot serves API and UI and is packaged and
  deployed as a single freestanding optimized JAR on RHEL virtual machines
  provisioned by NYS. Because the client is packaged with the server binary and
  is served by Spring Boot on the same domain as the API, no proxy or ingress is
  required.

To build the Maslow Access production binary:

```sh
./mvnw package -pl server/access -am -P release
```

To run the Maslow Access production binary on a RHEL virtual machine:

```sh
java -jar maslow-access-{version}.jar \
  --spring.config.additional-location=classpath:/locales/bn/application.yaml,classpath:/locales/es/application.yaml,classpath:/locales/ht/application.yaml,classpath:/locales/ko/application.yaml,classpath:/locales/ru/application.yaml,classpath:/locales/zh/application.yaml \
  --spring.profiles.active="production"
```

During **production**, the Maslow Author application has two process:

- **server** and **client**: Spring Boot serves API and UI and is packaged and
  deployed as a single freestanding optimized JAR on RHEL virtual machines
  provisioned by NYS. Because the client is packaged with the server binary and
  is served by Spring Boot on the same domain as the API, no proxy or ingress is
  required.
- **database**: A shared instance of MongoDB Community Server provisioned by
  NYS.

To build the Maslow Author production binary:

```sh
./mvnw package -pl server/author -am -P release
```

To run the Maslow Author production binary on a RHEL virtual machine:

```sh
java -jar maslow-author-{version}.jar --spring.profiles.active="production"
```

### Development

During **development**, the application has three processes:

- **server**: Spring Boot serves API only running on the local workstation. This
  can be hosted by Visual Studio Code (supporting both run and debug
  configurations) or run from a terminal.
- **client**: Create React App development server serves UI running on the local
  workstation. This can be hosted by Visual Studio Code (supporting both run and
  debug configurations) or run from a terminal. The development server proxies
  the API through the development server using an annotation in package.json.
- **database**: A local instance of MongoDB Community Server running in Docker
  on the local workstation. This can be hosted in Docker Desktop or run from a
  terminal.

If you'd like to run the server and exercise the API manually (either via REST
Client or Maslow Author), then you will need to instantiate a localhost instance
of MongoDB Community Server. I recommend that you use
[Docker](https://hub.docker.com/_/mongo) for this. You will NOT need Kubernetes,
Tilt, or Docker Compose.

```sh
# to create and start a new MongoDB container on localhost
docker run --name maslow-mongo --detach --publish 27017:27017 mongo:latest
# to <start|stop|restart> a previously created container
docker <start|stop|restart> maslow-mongo
```

Feel free to use the [Docker
Desktop](https://www.docker.com/products/docker-desktop) Dashboard or the
[Docker extension for Visual Studio
Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
if you'd like an alternative to the command line. The Visual Studio Code
extension is particularly nice, as you can open up a terminal to MongoDB right
within Visual Studio Code.

The Maslow Author Services API will automatically create the `maslow` database
and the `services` collection upon first write.

To start the server:

```sh
./mvnw spring-boot:run -pl server/access
```

To start the client:

```sh
yarn workspace maslow-access start
```

Both the client and server support live reload during development and will
automatically restart/refresh as needed when you make changes.

During development, there are several interesting endpoints for application:

- http://localhost:3000/ (resident-facing UI)
- http://localhost:8080/api/explore/v1/catalog (resident-facing API)
- http://localhost:8080/api/catalog/v1/ (HAL Explorer)
- http://localhost:8080/api/catalog/v1/questions (REST resource for internal-facing API)
- http://localhost:8080/api/catalog/v1/services (REST resource for internal-facing API)

## Additional instructions

**IMPORTANT**: All shell commands listed below should be executed from the root
of the repository.

### Server

We use Maven with multiple modules to support sharing Java code between the
servers. We can target which executable we want to target using the `-pl` (or
`--projects`) parameter to Maven.

Since the application modules (server/access and server/author) depend upon a
common library (server/shared), you should use the `-am` (or `--also-make`)
parameter when using the `-pl` parameter to build just one application. The
`-am` parameter will also make any module that the application depends on.

To initialize Maven and download any dependencies:

```sh
./mvnw install
```

To run the **access** or **author** servers:

```sh
./mvnw spring-boot:run -pl server/access
./mvnw spring-boot:run -pl server/author
```

The same mechanism works for building an optimized production binary using the
`package` goal.

```sh
./mvnw package -pl server/access -am
./mvnw package -pl server/author -am
```

However, because the steps to build the production binary include building the
client as well -- and building the client is very expensive -- the build steps
for the client are not included by default. Including these steps by default
makes the developer workflow in Visual Studio Code truly painful. If you are
building a package that also needs to include the client, you must enable the
`release` profile in Maven, like so:

```sh
./mvnw package -pl server/access -am -P release
./mvnw package -pl server/author -am -P release
```

In fact, you can build all three modules at once with a single command:

```sh
./mvnw package       # standard build
./mvnw -T 1C package # parallel build with 1 thread per core
```

To run tests for the **access** or **author** servers, as well as the shared
code:

```sh
./mvnw test -pl server/access -am
./mvnw test -pl server/author -am
./mvnw test -pl server/shared -am
```

You can also test all three modules at once with a single command:

```sh
./mvnw test
```

### Client

We use Yarn workspaces to to support sharing Javascript code between the
clients. We can target which executable we want target using the `yarn workspace` command.

To initialize Yarn and download any dependencies:

```sh
yarn install
```

To run the **access** or **author** clients:

```sh
yarn workspace maslow-access start
yarn workspace maslow-author start
```

The same mechanism works for building an optimized executable:

```sh
yarn workspace maslow-access build
yarn workspace maslow-author build
```

You can also run tests across all three workspaces:

```sh
yarn workspace maslow-access test
yarn workspace maslow-author test
yarn workspace maslow-shared test
```

You can even run all three sequentially with a single command:

```sh
yarn workspaces run test --watchAll=false
```

It's worth noting that the `maslow-shared` workspace would be an _excellent_
candidate for [Storybook].

[maven modules]: https://maven.apache.org/guides/mini/guide-multiple-modules.html
[project maslow]: https://github.com/ny/findservices
[storybook]: https://storybook.js.org/
[yarn workspaces]: https://classic.yarnpkg.com/en/docs/workspaces/

## Support

Please use our issue tracker at https://github.com/ny/findservices/issues.

## License

See [LICENSE](LICENSE).
