# space-agency

Este repo contiene una serie de ejemplos de ejecución síncrona vs asíncrona en
JavaScript. En particular los ejemplos están orientados a ilustrar diferentes
estrategias para _orquestar_ varias tareas asíncronas, no una sola de forma
aislada.

## Índice

* [Introducción](#introducción)
  - [Ejecución secuencial](#ejecución-secuencial)
    + [Código síncrono bloqueante](#código-síncrono-bloqueante)
    + [Código asíncrono secuencial no-bloqueante](#código-asíncrono-secuencial-no-bloqueante)
      * [Callback Hell](#callback-hell)
      * [Promesas encadenadas acumulando resultados](#promesas-encadenadas-acumulando-resultados)
      * [Promesas encadenadas compartiendo _estado_](#promesas-encadenadas-compartiendo-estado)
      * [`async/await`](#asyncawait)
  - [Ejecución concurrente (asíncrona y no-bloqueante)](#ejecución-concurrente-asíncrona-y-no-bloqueante)
    + [Callbacks refinados](#callbacks-refinados)
    + [`Promise.all`](#promiseall)
* [Implementaciones de ejemplo](#implementaciones-de-ejemplo)
  - [Síncrona bloqueante](#síncrona-bloqueante)
  - [Callback Hell](#callback-hell-1)
  - [Callbacks refinados](#callbacks-refinados-1)
  - [Promesas](#promesas)
* [Links](#links)

***

## Introducción

Para ilustrar diferentes conceptos y estrategias usaremos el ejemplo de la
librería `space-agency`, que esta diseñada para administradoras de agencias
espaciales :rocket:

En la introducción nos concentrarremos en cuatro funciones que exporta el módulo
`space-agency`: `buildRocket`, `fetchCrew`, `getFuel` y `bookLaunchPad`. Con
estas cuatro funciones asumimos que puedes _iniciar_ una misión!

La librería tiene varias implementaciones y nos ofrece diferentes versiones de
estas cuatro funciones: una [síncrona bloqueante](./sync/index.mjs), una
[asíncrona no-bloqueante con callbacks](./callbacks/index.mjs) y una
[asíncrona no-bloqueante con promesas](./promises/index.mjs). Por ahora solo
mencionamos su existencia, y no entraremos en sus detalles de implementación,
pero ahí está el código fuente si al final quedas con curiosidad (y aliento
:speak_no_evil:).

### Ejecución secuencial

El primer caso de estudio es aquel en el que queremos ejecutar una serie de
tareas de forma secuencial, una detrás de la otra, siempre esperando a que la
anterior se haya completado.


#### Código síncrono bloqueante

En nuestro rol de administradoras de la agencia espacial, nos toca dar inicio a
una nueva misión, para lo cual tenemos que llevar a cabo 4 tareas: construir un
cohete (`buildRocket`), conseguir una tripulación (`fetchCrew`), conseguir
combustible (`getFuel`) y reservar espacio en la lanzadera (`bookLaunchPad`).

Si nuestra intención es llevar a cabo las tareas de forma secuencial, y la
librería nos ofrece una versión _síncrona_ de estas funciones, podríamos de
forma _naive_ plantear nuestro programa así:

```js
const initMission = () => {
  const rocket = buildRocket();
  const crew = fetchCrew();
  const fuel = getFuel();
  const launchPad = bookLaunchPad();
  return { rocket, crew, fuel, launchPad };
};
```

La función `initMission` no espera ningún argumento y retorna un objeto con
cuatro propiedades: `rocket`, `crew`, `fuel` y `launchPad`. Cada una de estas
propiedades contiene el resultado de invocar a las funciones que nos da la
librería.

En el ejemplo de arriba asumimos que estamos usando la
[versión síncrona de la librería](./sync/index.mjs), y por tanto las funciones
`buildRocket` y compañia van a tomar el _control_, bloqueando el hilo de
ejecución, y una vez hayan terminado de hacer lo que tengan que hacer nos
_retornan_ el resultado de la operación y nos devuelven el _control_ - en el
caso de `buildRocket`, esta función _retorna_ un objeto `rocket` (el cohete), el
cual podemos asignar a una variable en el ámbito (scope) desde donde iniciamos
la tarea. Esto hace que sin mucho esfuerzo podamos tener los cuatro resultados
en el mismo ámbito, lo cual necesitamos para retornar un objeto que contenga los
cuatro.

Pero, ... :warning: esta implementación tiene un problema **grave**. Asumimos
que las funciones de la librería van a requerir un tiempo (probablemente largo)
para llevarse a cabo, y al cederle el _control_ a estas funciones, estas van a
bloquear el hilo hasta completarse, y solo después nos devuelven el _control_
al _retornar_ el resultado. Como JavaScripters esto es un problema serio por
muchos motivos, pero principalmente 2:

* En el navegador nuestro JavaScript comparte hilo con otras tareas como el
  _re-flow_ y _re-paint_ que se encargan de actualizar la interfaz. Esto
  significa que mientras esté el hilo bloqueado la pantalla se queda
  completamente congelada y sin input del usuario :scream:
* En Node.js, en un servidor todas las consultas (_requests_) se manejan desde
  un solo hilo, y mientras estemos bloqueando el hilo nuestro servidor no podrá
  atender nuevas consultas :shit:

[Acá puedes ver en una interfaz web](https://lupomontero.github.io/space-agency/sync/)
cómo la ejecución de nuestro programa bloquea el hilo y no permite que se
actualice la interfaz hasta que no termine.

#### Código asíncrono secuencial no-bloqueante

Ok, entonces veamos cómo evitamos _bloquear el hilo_. Los ejemplos a
continuación muestran varias estrategias para ejecutar las cuatro tareas que
necesitamos.

##### Callback Hell

Pasemos a usar la [implementación de la librería basada en callbacks](./callbacks/index.mjs).
Ahora, cuando aterrizamos en el mundo de JavaScript es común caer en situaciones
en las cuales, a partir de lógica como la que hemos visto en el primer ejemplo
de ejecución síncrona, terminamos escribiendo cosas como lo siguiente al tratar
de amoldarnos a la _interfaz_ de _callbacks_:

```js
const initMission = (cb) => {
  buildRocket((err, rocket) => {
    if (err) {
      return cb(err);
    }
    fetchCrew((err, crew) => {
      if (err) {
        return cb(err);
      }
      getFuel((err, fuel) => {
        if (err) {
          return cb(err);
        }
        bookLaunchPad((err, launchPad) => {
          if (err) {
            return cb(err);
          }
          cb(null, { rocket, crew, fuel, launchPad });
        });
      });
    });
  });
};
```

En esta nueva implementación recibimos un argumento (un _callback_ - `cb`), que
usaremos para comunicar el resultado de la operación, en vez de _retornar_ un
valor. Si nos fijamos, esta implementación también produce como _resultado_ un
objeto igualito al ejemplo anterior, pero esta vez este valor se pasará como
argumento al callback que recibimos originalmente (`cb`) y no como valor de
retorno de la función `initMission`, ya que a la hora de retornar en la función
`initMission` todavía no tenemos el _resultado_. De hecho la función
`initMission` implicitamente retorna `undefined` (ya que no hay una sentencia
`return`), y desde el punto de vista del invocador, ignoramos completamente el
valor de retorno (fíjate que no asignamos el valor de retorno de las funciones
de la librería, si no que la comunicación con la _operación_ se hace a través
del _callback_). En este caso cedemos el _control_ a la función a la hora de
invocarla, y esta nos devuelve el _control_ inmediatamente al retornar, pero el
resultado no lo tendremos hasta más adelante (en otro ciclo del bucle de
eventos), cuando volvamos a tomar _control_ en el futuro cuando se invoque el
_callback_.

En este ejemplo todavía estamos ejecutando las tareas de forma secuencial, pero
por lo menos ya no estamos bloquenado el hilo. Pero ... probablemente ya te
diste cuenta de que este ejemplo se llama _callback hell_, y como puedes ver,
al _continuar_ la ejecución del programa a través de los callbacks, rápidamente
nuestro código se va anidando, con un montón de repetición en el manejo de
errores, y poco a poco se hace cada vez más difícil de entender. Para ver un
ejemplo más obvio de cómo aumenta la complejidad de nuestro código,
[acá](./callbacks/example-hell.mjs) puedes ver una _misión_ de ejemplo usando
este enfoque _naive_ de callbacks produciendo un _callback hell_ horroroso
:fire:

[Acá puedes ver en una interfaz web](https://lupomontero.github.io/space-agency/callbacks/hell.html)
cómo evitamos bloquear el hilo con callbacks. Fíjate que, ahora que ya no
bloqueamos el hilo, el navegador ahora sí tiene la oportunidad de actualizar el
DOM durante la ejecución. Eso sí, al seguir siendo secuencial, toavía demora
aprox. 20 segundos en completarse.

##### Promesas encadenadas acumulando resultados

Existen varias estrategias para mitigar el _callback hell_, y si nuestra
intención es ejecutar tareas asíncronas en series, de forma secuencial, podemos
valernos de que las promesas se pueden encadenar a través de su `.then`.

Si no nos interesara el valor al que resuelven las promesas, podríamos imaginar
algo así:

```js
const initMission = () => (
  buildRocket()
    .then(fetchCrew)
    .then(getFuel)
    .then(bookLaunchPad)
    .then(() => {
      // Llegado a este punto sabemos que se han resuelto las cuatro promesas.
    });
);
```

Pero nuestra función `initMission` debe retornar un objeto con los valores a los
que han resuelto las promesas. Así que necesitamos tener los cuatro valores en
el mismo ámbito para poder combinarlos en un objeto. Para hacer más visble el
_problema_ que se presenta, hagamos explícito que las promesas resuelven a
valores que sí nos interesan dando nombre a los argumentos que reciben los
callbacks que les pasamos a los `.then`:

```js
const initMission = () => (
  buildRocket()
    .then(rocket => fetchCrew())
    .then(crew => getFuel())
    .then(fuel => bookLaunchPad())
    .then((launchPad) => {
      // Acá tenemos acceso a `launchPad`, ...
      // ... pero no a `rocket`, ni `crew`, ni `fuel` :-(
    });
);
```

Para conseguir _juntar_ los valores de `rocket`, `crew`, `fuel` y `launchPad`,
podemos seguir varias estrategias. La primera que les quiero presentar es esta
que hemos llamado _promesas encadenadas acumulando resultados_.

```js
const initMission = () => (
  buildRocket()
    .then(rocket => fetchCrew().then(crew => ({ rocket, crew })))
    .then(results => getFuel().then(fuel => ({ ...results, fuel })))
    .then(results => bookLaunchPad().then(launchPad => ({ ...results, launchPad })));
);
```

Como vemos en el _snippet_ de arriba, ahora _interceptamos_ la resolución cada
promesa individual (ver los `.then` anidados), para agregar el resultado de la
promesa actual a un objeto que contiene las respuestas de las promesas
anteriores. De esta manera logramos _juntar_ todos estos valores en un mismo
_ámbito_, pero la implementación resulta menos elegante...

##### Promesas encadenadas compartiendo _estado_

Alternativamente a las _promesas encadenadas acumulando resultados_, podemos
también usar una variable _compartida_ para ir acumulando los resultados,
consiguiendo un efecto parecido:

```js
const initMission = () => {
  const results = {};

  return buildRocket()
    .then((rocket) => {
      results.rocket = rocket;
      return fetchCrew();
    })
    .then((crew) => {
      results.crew = crew;
      return getFuel();
    })
    .then((fuel) => {
      results.fuel = fuel;
      return bookLaunchPad();
    })
    .then((launchPad) => {
      results.launchPad = launchPad;
    })
    .then(() => {
      // Ya tenemos todos los resultados!
      return results;
    });
};
```

Esta última versión es un poco más _verbose_ y hace uso de
_estado compartido y mutable_ a través de la variable `results`.

##### `async/await`

Como tercera alternativa a una implementación secuencial no-bloqueante con
promesas, podemos en este caso hacer uso de `async/await`, que para este caso
concreto (ejecución secuencial) nos permite expresar nuestra función
`initMission` de una forma muy parecida al ejemplo original bloqueante, donde
el orden de ejecución corresponde al orden del código, pero con el beneficio de
no bloquear el hilo.

```js
const initMission = async () => {
  const rocket = await buildRocket();
  const crew = await fetchCrew();
  const fuel = await getFuel();
  const launchPad = await bookLaunchPad();
  return { rocket, crew, fuel, launchPad };
};
```

Como referencia de uso de `async/await`, en las
[pruebas unitarias de la versión que usa promesas](./promises/index.spec.js) de
nuestra librería `space-agency` puedes ver como se ha usado en los tests,
quedando iguales que los tests de la versión síncrona, pero con la adición de
las palabras claves `async` y `await`.

### Ejecución concurrente (asíncrona y no-bloqueante)

Después de varias misiones, vamos aprendiendo sobre nuestro rol de
administradoras de una agencia espacial, y nos damos cuenta de que las cuatro
tareas con las que preparamos una misión (`buildRocket`, `fetchCrew`, `getFuel`
y `bookLaunchPad`), no tienen ninguna _dependencia_ entre ellas. Esto significa
que ninguna de estas funciones necesita como input un valor producido por alguna
de las otras. Básicamente no necesitamos esperar a que una tarea termine para
comenzar con la siguiente.

Hasta este punto hemos visto estrategias para organizar tareas de forma
secuencial. Ahora veamos cómo podríamos ejecutar estas tareas de forma
_concurrente_. Con esto queremos decir que en vez de ejecutar las tareas una
detrás de otra, siempre esperando a que termine la anterior para comenzar la
siguiente, ahora queremos inciar todas _a la vez_, y esperar a que todas
completen para producir un _resultado_. De esta forma las tareas comparten el
tiempo de espera y reducimos el tiempo total que lleva completar el conjunto de
tareas.

#### Callbacks refinados

Hasta la llegada de las promesas a JavaScript, la orquestación de tareas
asíncronas era un _pain_ que el lenguaje en sí no terminaba de solucionar, y
tocaba apoyarse de librerías como [`async`](https://www.npmjs.com/package/async)
de [Caolan McMahon](https://github.com/caolan), que durante mucho tiempo fue la
librería más descargada en `npm`, para contar con abstracciones que nos
permirieran _orquestar_ operaciones asíncronas basadas en _callbacks_.

La idea, en la ejecución concurrente de funciones asíncronas con callbacks, es
iniciar todas las tareas dentro del mismo ciclo del _bucle de eventos_ (_event
loop_).

```js
const initMission = (cb) => {
  const results = {};

  buildRocket((err, rocket) => {
    if (err) {
      return cb(err);
    }
    results.rocket = rocket;
    if (result.crew) {
      // Si además de rocket también tenemos `crew`, significa que ya terminamos!
      cb(null, results);
    }
  });

  fetchCrew((err, crew) => {
    if (err) {
      return cb(err);
    }
    results.crew = crew;
    if (results.rocket) {
      // Si además de crew también tenemos `rocket`, significa que ya terminamos!
      cb(null, results);
    }
  });
};
```

En el ejemplo de arriba, por brevedad hemos omitido dos tareas, pero ilustra la
idea de iniciar todas las tareas _a la vez_. Eso sí, terminamos con bastante
repetición y maquinaria para determinar cuándo se han terminado las tareas,
además de necesitar un mecanismo para compartir o acumular un resultado final.
Por eso la necesidad de librerías o herramientas para este tipo de estrategias.

Como ejemplo, acá pueden ver un par de _helpers_ ([`concurrent`](./callbacks/example.mjs#L3)
y [`series`](./callbacks/example.mjs#L36)) que usa la impementación
modelo del ejemplo de callbacks para abstraer ejecución en serie y concurrente.
Usando estas utilidades, podríamos llegar a expresar la intención de ejecutar
una conjunto de tareas de forma concurrente con algo así:

```js
const initMission = cb => concurrent({
  rocket: buildRocket,
  crew: fetchCrew,
  fuel: getFuel,
  launchPad: bookLaunchPad,
}, cb);
```

[Acá puedes ver en una interfaz web](https://lupomontero.github.io/space-agency/callbacks/)
cómo evitamos bloquear el hilo con callbacks, y hacemos las tareas de forma
concurrente, como en el ejemplo de arriba. Fíjate que ahora que hacemos las
tareas de `initMission` de forma concurrente, el tiempo total de la _misión_ ha
disminuido considerablemente (de veintitantos segundos a 11!).

#### `Promise.all()`

En la sección anterior (_Callbacks refinados_), comenzamos por decir que _hasta
la llegada de las promesas..._, y las promesas ya llegaron hace rato! :wink:

Y con la llegada de las promesas, ya no necesitaríamos ninguna utilidad externa
(o que implementemos nosotros), si no que podemos usar la API de promesas para
solucionar el mismo problema de una forma más elegante. En particular, el
_constructor_ `Promise` tiene un método estático que se llama `Promise.all`, que
nos permite justamente darle un arreglo de promesas como input, y nos devuelve
una nueva promesa que se resolverá cuando resuelvan todas las promesas que
recibió como input, produciendo como resultado un arreglo con un elemento por
cada promesa en el arreglo del input.

```js
const initMission = () => Promise.all([
  buildRocket(),
  fetchCrew(),
  getFuel(),
  bookLaunchPad(),
])
  .then(([rocket, crew, fuel, launchPad]) => ({
    rocket,
    crew,
    fuel,
    launchPad
  }));
```

En caso de que cualquiera de las promesas recibidas por `Promise.all` sea
rechazada, la promesa que las engloba (la retornada por `Promise.all`) será
también rechazada.


[Acá puedes ver en una interfaz web](https://lupomontero.github.io/space-agency/promises/)
cómo se comporta esta implementación que hace uso de promesas y concurrencia con
`Promise.all` como en el ejemplo de arriba.

## Implementaciones de ejemplo

### Síncrona bloqueante

* [UI - Ejemplo](https://lupomontero.github.io/space-agency/sync/)
* [Código fuente - Ejemplo](./sync/example.mjs)
* [Código fuente - Librería](./sync/index.mjs)
* [Pruebas](./sync/index.spec.js)

### Callback hell

* [UI - Ejemplo](https://lupomontero.github.io/space-agency/callbacks/hell.html)
* [Código fuente - Ejemplo](./callbacks/example-hell.mjs)
* [Código fuente - Librería](./callbacks/index.mjs)
* [Pruebas](./callbacks/index.spec.js#L85)

### Callbacks refinados

* [UI - Ejemplo](https://lupomontero.github.io/space-agency/callbacks/)
* [Código fuente - Ejemplo](./callbacks/example.mjs)
* [Código fuente - Librería](./callbacks/index.mjs)
* [Pruebas](./callbacks/index.spec.js)

### Promesas

* [UI - Ejemplo](https://lupomontero.github.io/space-agency/promises/)
* [Código fuente - Ejemplo](./promises/example.mjs)
* [Código fuente - Librería](./promises/index.mjs)
* [Pruebas](./promises/index.spec.js)


## Links

* [Callbacks - Laboratoria/bootcamp](https://github.com/Laboratoria/bootcamp/tree/master/topics/javascript/08-async/01-callbacks)
* [Promesas - Laboratoria/bootcamp](https://github.com/Laboratoria/bootcamp/tree/master/topics/javascript/08-async/05-promises)
* [Función Callback - MDN](https://developer.mozilla.org/es/docs/Glossary/Callback_function)
* [Promise - MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Promise)
* [Promise.all - MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Promise/all)
* [Loupe](http://latentflip.com/loupe/)
* [What the heck is the event loop anyway? | Philip Roberts | JSConf EU - YouTube](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
* [Formas de manejar la asincronía en JavaScript - Carlos Azaustre](https://carlosazaustre.es/manejando-la-asincronia-en-javascript)
* [Event Loop: la naturaleza asincrónica de Javascript - @ubykuo - Medium](https://medium.com/@ubykuo/event-loop-la-naturaleza-asincr%C3%B3nica-de-javascript-78d0a9a3e03d)
* [Javascript Asíncrono: La guía definitiva - Lemon Code](https://lemoncode.net/lemoncode-blog/2018/1/29/javascript-asincrono)
