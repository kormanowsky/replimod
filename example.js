import ModelBuilder from "./index";

const MyAPIModelBuilder = new ModelBuilder().setBaseURL("http://mysite.com/my-api");
const MyNiceModel = MyAPIModelBuilder.setResource("nice-models").build();

const niceObject = new MyNiceModel(1);
niceObject.retrieve().then(niceObject => {
    console.log(niceObject.id);
});