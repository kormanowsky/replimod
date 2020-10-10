import RestClient from "another-rest-client";
import { allMethodsOf, camelToKebab } from "./util";

/**
 * The main model class.
 * @class Model
 * @author Mikhail Kormanowsky
 * @since 2.0.0
 */
class Model {
  // Configuration

  /**
   * Creates new empty model instance and returns it
   * @returns {Model}
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  static newInstance() {
    return new this();
  }

  /**
   * Sets .baseURL properyty so that this class knows where to go to for the data.
   * @param baseURL The base URL of the API.
   * @example Pass https://myapi.com/api if your API addresses start with this URL.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  static useBaseURL(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Sets .modelName property for this class to know the name of the model.
   * Class name is not used because it may be changed by code mificators/builders like one
   * that comes with React.js
   * @param name The model name
   * @example Pass car if your API URL is https://myapi.com/api/car
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  static useName(name) {
    this.modelName = name;
  }

  /**
   * Sets .conf property for this class.
   * conf is RestClient's configuration
   * @param conf The configuration
   * @example {contentType: 'application/x-www-form-urlencoded'}
   * @author Mikhail Kormanowsky
   * @since 2.2.0
   */
  static useConf(conf) {
    this.conf = conf;
  }

  /**
   * An abstract method which gets called before each request.
   * @param xhr A XMLHttpRequest object with current request.
   * @author Mikhail Kormanowsky
   * @since 2.1.0
   */
  static onRequest(xhr) {}

  // API client

  /**
   * Returns the api client of this model. This is static method so the client will not be linked to any specific
   * model instance.
   * @todo Decide how to separate static model methods from object ones.
   * @returns {RestClient|module.exports} An instance of RestClient containing API client for current model.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  static get apiClient() {
    const client = new RestClient(this.baseURL, this.conf || {});
    client.res(this.modelName).res(
      allMethodsOf(this)
        .filter((method) => method !== "constructor")
        .map((method) => camelToKebab(method))
    );
    client.on("request", this.onRequest);
    return client[this.modelName];
  }

  // The constructor and instance API client.

  /**
   * The constructor. Sets .id property.
   * @param id The ID of the object.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  constructor(id) {
    this.id = id;
  }

  /**
   * Returns the api client of this model instance. This method uses return value of its static brother but makes
   * the object instance-related.
   * @see Model.apiClient
   * @returns {RestClient|module.exports|*} An instance of RestClient containing API client for current model instance.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  get apiClient() {
    const client = this.constructor.apiClient;
    if (this.id) {
      return client(this.id);
    }
    return client;
  }

  // Filling in

  /**
   * Fills in this instance with data of given object obj.
   * @param obj An object to get the data from.
   * @returns {*} Returns this instance with given data.
   * @description This method calls .preFillIn(), then fills in the instance, then calls .postFillIn().
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  fillIn(obj) {
    if (!(this._data instanceof Object)) {
      this._data = {};
    }
    for (let prop of Object.getOwnPropertyNames(obj)) {
      this._data[prop] = obj[prop];
    }
  }

  // Basic API methods

  /**
   * Retrieves a list of instance form the server.
   * @param args
   * @returns {Array} A promise with an array which contains retrieved list.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  static async list(args) {
    args = args || {};
    let list = await this.apiClient.get(args);
    return list.map((obj) => this.newInstance().fillIn(obj));
  }

  /**
   * Uses given data to create new model instance.
   * @param data The data of new instance.
   * @returns {Promise<*|Model>} A promise with created model instance.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  static async create(data) {
    let instance = this.newInstance();
    return instance.fillIn(await instance.apiClient.post(data));
  }

  /**
   * Retrieves this instance from the server.
   * @returns {Promise<*>} A promise with received instance.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  async retrieve() {
    return this.fillIn(await this.apiClient.get());
  }

  /**
   * Updates this instances using given data.
   * @param data An update for the instance.
   * @returns {Promise<*>} A promise with updated instance.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  async update(data) {
    return this.fillIn(await this.apiClient.patch(data));
  }

  /**
   * Deletes this instance.
   * @returns {boolean | Promise<boolean> | void | IDBRequest<undefined>} Result of .delete() method of the RestClient class.
   * @author Mikhail Kormanowsky
   * @since 2.0.0
   */
  delete() {
    return this.apiClient.delete();
  }
}

export default Model;
export { allMethodsOf, camelToKebab };
