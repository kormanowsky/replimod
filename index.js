import RestClient from "another-rest-client";
import {camelCaseToHyphen} from "./util";

/**
 * @class NoResourceError
 * @since 1.0.0
 * @author Михаил Кормановский
 * Ошибка, которая выбрасывается, если у модели нет API-ресурса.
 */
class NoResourceError extends Error {

    constructor() {
        super();
        this.message = "Работа без указания ресурса невозможна!";
    }
}

/**
 * @class NoBaseURLError
 * @since 1.0.0
 * @author Михаил Кормановский
 * Ошибка, которая выбрасывается, если при создании модели не указан базовый URL.
 */
class NoBaseURLError extends Error {

    constructor() {
        super();
        this.message = "Работа без указание базового URL API невозможна!";
    }
}

/**
 * Абстрактный класс модели. Сдержит общую логику для всех моделей.
 * @class Model
 * @since 1.0.0
 * @author Михаил Кормановский
 * @see RestClient
 *
 */
class Model {

    /**
     * Инициализирует объект модели. Если аргумент @param arg - число, будет проинициализирован объект с ID, равным данному числу.
     * Если аргумент - объект, все его свойства будут сопированы в создаваемый объект. Если не было передано ни одного аргумента,
     * будет создан пустой экземпляр (что удобно при использовании во внутренних методах, например, при создании нового объекта).
     * @param {Number|Object} arg Аргумент.
     * @see #fillIn
     * @see #$resource
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    constructor(arg) {
        const api = new RestClient(getAPIHost());
        resourceName = camelCaseToHyphen(this.constructor.config.resource);
        api.res(resourceName).res(this.constructor.config.innerResources);
        api.on("request", xhr => {
            this.constructor.config.requestListeners.forEach(listener => listener(xhr));
        });
        this.$resource = api[resourceName];
        if (!isNaN(parseInt(arg))) {
            this.id = parseInt(arg);
            this.$resource = this.$resource(this.id);
        } else if (arg instanceof Object) {
            this.fillIn(arg);
        }
    }

    /**
     * Заполняет данный экземпляр данными из объекта @param obj . Перед заполнением будет вызван метод @method Model#beforeFillIn ,
     * после заполнения - метод @method Model#afterFillIn .
     * @param {Object} obj Объект с новыми данными.
     * @returns {Model} Возвращает данный объект, но с новыми данными.
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    fillIn(obj) {
        if (this.beforeFillIn instanceof Function) {
            this.beforeFillIn(obj);
        }
        for (let prop in obj) {
            if (obj[prop] instanceof String) {
                let date = new Date(obj[prop]);
                if (date.toString() != "Invalid Date") {
                    obj[prop] = date;
                }
            }
            if (!this[prop] || !(this[prop] instanceof Function)) {
                this[prop] = obj[prop];
            }
        }
        if (this.id) {
            this.$resource = this.$resource(this.id);
        }
        if (this.afterFillIn instanceof Function) {
            this.afterFillIn(obj);
        }
        return this;
    }

    /**
     * Получает все объекты данной модели, если нет ресурса - выбрасывает ошибку.
     * @async
     * @static
     * @param args Дополнительные GET параметры. ПО умолчанию - пустой объект.
     * @returns {Array} Массив с полученными объектами.
     * @see #$resource
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    static async list(args) {
        args = args || {};
        let list = await new this().$resource.get(args);
        let value = [];
        list.forEach(obj => {
            let instance = new this();
            instance.fillIn(obj);
            value.push(instance);
        });
        return value;
    }

    /**
     * Создает новый объект, используя данные из параметра @param data и возвращает его.
     * @async
     * @static
     * @param {Object} data Данные нового объекта.
     * @returns {Model} Возвращает созданный объект.
     * @see #$resource
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    static async create(data) {
        let instance = new this();
        return instance.fillIn(await instance.$resource.post(data));
    }

    /**
     * Скачивает объект с API-ресурса и возвращает его.
     *
     * @async
     * @returns Возвращает скачанный объект.
     * @see #$resource
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    async retrieve() {
        return this.fillIn(await this.$resource.get());
    }

    /**
     * Обновляет объект, используя данные, переданные в параметре @param data, и возвращает объект.
     * @async
     * @param {Object} data Новые данные.
     * @returns Возвращает обновленный объект.
     * @see #$resource
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    async update(data) {
        return this.fillIn(await this.$resource.patch(data));
    }

    /**
     * Удаляет объект.
     * @async
     * @returns Возвращает Promise от библиотеки RestClient.
     * @see RestClient#delete
     * @see #$resource
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    delete() {
        return this.$resource.delete();
    }
}

/**
 * Строитель модели. Собирает настройки с помощью цепочки вызовов.
 * @class ModelBuilder
 * @since 1.0.0
 * @author Михаил Кормановский
 */
class ModelBuilder {

    constructor() {
        this.config = {
            resource: null,
            baseURL: null,
            requestListeners: [],
            innerResources: [],
        };
    }

    /**
     * Добавляет слушаель события "request" библиотеки RestClient. Слушатель должен принимать параметр xhr - объект
     * текущего xhr-запроса.
     * @param listener Добавляемый слушатель события
     * @returns {ModelBuilder} Текущий объект строителя.
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    addOnRequestListener(listener) {
        this.config.requestListeners.push(listener);
        return this;
    }

    /**
     * Устанавливает базовый URL адрес ресурса
     * @param baseURL Базовый URL, который будет использоваться для модели.
     * @example Для модели Car из API http://cars.com/api/ будет исполльзоваться URL:
     * http://cars.com/api/cars. В этот метод нужно передать "http://cars.com/api/".
     * @returns {ModelBuilder} Текущий объект строителя.
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    setBaseURL(baseURL) {
        this.config.baseURL = baseURL;
        return this;
    }

    /**
     * Устанавливает URL-адрес ресурса (часть адреса после базового URL API)
     * @param resource Строка ресурса, которая будет использоваться для модели.
     * @example Для модели Car из API http://cars.com/api/ будет исполльзоваться URL:
     * http://cars.com/api/cars. В этот метод нужно передать "cars".
     * @returns {ModelBuilder} Текущий объект строителя.
     * @since 1.0.0
     * @author Михаил Кормановский
     */
    setResource(resource) {
        this.config.resource = resource;
        return this;
    }

    /**
     * Добавляет новый внутренний API-ресурс модели в список внутренних ресурсов. Внутренние ресурсы имеют URL вида
     * BASE_URL/RESURCE/INNER_RESOURCE
     * @param resource Часть URL внутреннего ресурса после названия основного ресурса.
     * @since 1.0.0
     * @author Михаил Кормановский
     * @returns {ModelBuilder} Текущий объект строителя.
     */
    addInnerResource(resource) {
        this.config.innerResources.push(resource);
        return this;
    }

    /**
     * Перезаписывает список внутренних API-ресурсов модели.
     * @param resources Список, содержащий часть URL внутренних ресурсов после названия основного ресурса.
     * @since 1.0.0
     * @author Михаил Кормановский
     * @returns {ModelBuilder} Текущий объект строителя.
     */
    setInnerResources(resources) {
        this.config.innerResources = resources;
        return this;
    }

    /**
     * Строит класс модели.
     * @returns {any}
     * @since 1.0.0
     * @author Михаил Кормановский
     * @throws NoBaseURLError
     * @throws NoResourceError
     */
    build() {
        if (!this.config.baseURL) {
            throw new NoBaseURLError();
        }
        if (!this.config.resource) {
            throw new NoResourceError();
        }
        const config = this.config;
        return class extends Model {
            get config() {
                return config;
            }
        }
    }
}

export default ModelBuilder;