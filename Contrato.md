<!-- Url base -->

http://localhost:3000/api (desarrollo)
https://hief-journal.gob.ar/api (producción)

<!-- Respuesta estandar -->

export interface ApiResponse<T = unknown> {
success: boolean;
data?: T;
error?: string;
}

<!-- Autenticacion -->

Se usa cookie HttpOnly llamada token.

Las peticiones del frontend deben usar withCredentials: true.

El backend valida la cookie con un middleware antes de llegar al controlador.

<!-- Login -->

interface LoginRequest {
email: string;
password: string;
}

<!-- Endpoint -->

https://docs.google.com/document/d/1T2Ut4HomL4WA1R9vahMAuwWGxibTleDNzvCQW3NDbBE/edit?tab=t.0
