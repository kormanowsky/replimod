// 1. Import Model class.
import Model from "./model";

// 2. Set base URL.
Model.baseURL("https://myapi.com/api");

// 3. Inherit from Model class
class Car extends Model{

    // 3.1 Each method of the class will be converted to API resource
    // This method will connect to https://myapi.com/api/cars/%CAR_ID%/repair using POST method
    async repair(){
        return this.apiClient().repair.post();
    }
}

// 4. Add name for your model
Car.useName("cars");