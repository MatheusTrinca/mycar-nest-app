
# Ordem de Execução de Middlewares, Guards e Interceptors em NestJS

No NestJS, a ordem de execução de middlewares, guards e interceptors é bem definida e segue uma sequência específica. Aqui está a ordem de execução para uma requisição HTTP típica:

1. **Middlewares**: São funções que podem modificar a requisição ou a resposta antes que ela chegue ao controlador. Eles são executados primeiro e em ordem sequencial conforme definidos no aplicativo. Eles têm acesso aos objetos de requisição (`req`), resposta (`res`) e a função `next()` para passar o controle para o próximo middleware.

2. **Guards**: São usados para determinar se a requisição pode ou não acessar uma determinada rota. Eles são executados após os middlewares, mas antes dos pipes e dos interceptors. Os guards são especialmente úteis para implementar lógica de autorização e controle de acesso.

3. **Interceptors (antes)**: São executados antes do manipulador de rota. Eles podem transformar a requisição antes que ela chegue ao controlador, assim como modificar a resposta antes de enviá-la de volta ao cliente. Interceptors são úteis para lógica de logging, tratamento de erros, e modificação de respostas.

4. **Pipes**: Executados depois dos guards e antes do manipulador de rota, os pipes são usados para transformar e validar os dados da requisição. Eles podem transformar os dados de entrada em uma forma esperada pelo manipulador de rota.

5. **Manipulador de Rota (Route Handler)**: O controlador que lida com a lógica da rota específica é executado aqui. É onde o processamento principal da requisição ocorre.

6. **Interceptors (depois)**: Depois que o manipulador de rota processa a requisição, os interceptors podem novamente modificar a resposta antes de enviá-la de volta ao cliente.

7. **Exception Filters**: São usados para capturar e processar exceções lançadas no manipulador de rota ou em qualquer um dos interceptors que tenham sido executados. Eles fornecem uma maneira centralizada de tratar erros e enviar respostas adequadas ao cliente.

Para resumir a ordem:

1. **Middlewares**
2. **Guards**
3. **Interceptors (antes)**
4. **Pipes**
5. **Manipulador de Rota**
6. **Interceptors (depois)**
7. **Exception Filters**

Essa ordem garante que cada componente possa cumprir seu papel específico no ciclo de vida da requisição/resposta de maneira ordenada e previsível.

## Exemplos de Cada Componente

### 1. Middleware

Middlewares são usados para realizar tarefas como logging, autenticação, etc., antes que a requisição alcance o controlador.

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request...`);
    next();
  }
}

// Aplicação do middleware no módulo
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

@Module({
  // suas importações, controladores e provedores
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
```

### 2. Guard

Guards são usados para determinar se a requisição pode acessar a rota.

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}

function validateRequest(request: any): boolean {
  // Sua lógica de validação
  return true; // ou false se a validação falhar
}

// Aplicação do guard no controlador
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return [];
  }
}
```

### 3. Interceptor

Interceptors são usados para transformar ou modificar a requisição/resposta.

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(map(data => ({ data })));
  }
}

// Aplicação do interceptor no controlador
import { Controller, Get, UseInterceptors } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  @UseInterceptors(TransformInterceptor)
  findAll() {
    return ['cat1', 'cat2'];
  }
}
```

### 4. Pipe

Pipes são usados para transformar e validar dados de entrada.

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}

// Aplicação do pipe no controlador
import { Controller, Get, Param } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    return { id };
  }
}
```

### 5. Exception Filter

Exception Filters são usados para capturar e processar exceções lançadas no manipulador de rota ou interceptors.

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}

// Aplicação do exception filter no controlador
import { Controller, Get, UseFilters } from '@nestjs.common';

@Controller('cats')
export class CatsController {
  @Get()
  @UseFilters(HttpExceptionFilter)
  findAll() {
    throw new HttpException('Forbidden', 403);
  }
}
```

Esses exemplos cobrem as funcionalidades básicas de cada um dos componentes (middlewares, guards, interceptors, pipes e exception filters) em uma aplicação NestJS.
