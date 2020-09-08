# RePLiMod - The REST API client-side model utility class
## Meaning of the title 
REst aPi cLIent MODel
## Purpose of the class 
Replimod was developed in order to let developers save their time when creating a client for REST API. 
This library provides a simple way of working with such API. It consists of the main class, called `Model` and a couple of utility functions used by the class. 
## What is a Model?
A Model is a single data type, it is similar to tables in the database. 
`Model` class provides basic methods like `.create()` for creating new instances or `.delete()` for removing existng ones. 
The class may be extended by developers to achieve custom behaviour such as custom API methods or request authorization. 
## Installation 
`npm install replimod`
## How to use it. 
You may find a working example in `example.js`
