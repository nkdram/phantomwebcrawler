'use strict';
const sqlConfig = {
    user: 'sitecoreuser',
    password: 'su',
    server: '(local)\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
    database: 'Migration',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};

const Sequelize = require('sequelize');
const sequelize = new Sequelize('Migration', 'sitecoreuser', 'su', {
    host: 'DESKTOP-4JR64QH',
    dialect: 'mssql',
    "dialectOptions":{
        "instanceName": "SQLEXPRESS"
        //"port":1433
    }
});



exports.testConnection = function(data, socket, callback){
    console.log('MSSQL Controller');
    sequelize
        .authenticate()
        .then(function(){
            console.log('Connection has been established successfully.');
            callback(
                {
                    status: true
                }
            );
        })
        .catch( function(err) {
            console.error('Unable to connect to the database:', err);
            callback(
                {
                    status: false
                }
            );
        });
};

exports.insertRecords = function(html, url, socket, callback){
    console.log('MSSQL Controller');
    sequelize
        .authenticate()
        .then(function(){
            console.log('Connection has been established successfully.');
        })
        .catch( function(err) {
            console.error('Unable to connect to the database:', err);
        }).done();

    //Check if Table exists
    var tableName = html[0].columnName;

    var checkIfTableiSPresent = "IF EXISTS (SELECT 1"+
    " FROM Migration.INFORMATION_SCHEMA.TABLES"+
    " WHERE TABLE_TYPE='BASE TABLE'"+
    " AND TABLE_NAME='"+ tableName +"')"+
    "SELECT 1 AS res ELSE SELECT 0 AS res;";




    var insertUpdate  = function (model,values, condition) {
        return model
            .findOne({ where: { "ItemIdentity" : condition } })
            .then(function(obj) {
                console.log('vale');
                console.log(obj);
                if(obj==null) { // insert
                    return model.create(values);
                }
                else { // update
                    return obj.update(values);
                }
            });
    };

    var insertAllRecords = function(model, rows, socket,callback){
          var totalRec = rows.length;
          console.log(totalRec);
          for(var i=0; i<rows.length; i++){
              var currentRow = rows[i];
              var rowJSON = {};
              for(var j=0; j< currentRow.children.length; j++){
                  rowJSON = CreateProp(rowJSON, currentRow.children[j].columnName, currentRow.children[j].html);
              }
              rowJSON = CreateProp(rowJSON, "ItemIdentity", (url + i.toString()));
              insertUpdate(model, rowJSON, (url + i.toString())).then(function(result){
                  socket.emit('log',{message: 'Insertion of record:' + rowJSON  });
                  --totalRec;
                  if(totalRec==0)
                  {
                      callback({
                          status:true
                      });
                  }
              });
          }
    };

    function CreateProp(obj,propertyName, propertyValue)
    {
        obj[propertyName] = propertyValue;
        return obj;
    };

    var escapeJson = function(string){
       return string.replace(/\\n/g, "\\n")
            .replace(/\\'/g, "\\'")
            .replace(/\\"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f").replace(/\\\\/g, "\\");
    };

    sequelize.query(checkIfTableiSPresent,
        { type: sequelize.QueryTypes.SELECT})
        .then(function(lData) {
            console.log(lData);
            //If data is not present
            if(lData[0].res == 0){
                //Firs Row = data [0]
                //  " \"ID\" : { \"type\": \"INTEGER\", \"autoIncrement\": true , \"allowNull\": false} "
                //" ,
                var strJson ="ItemIdentity\" : { \"type\": \"NVARCHAR(250)\", \"primaryKey\": true } ";
                for(var i=0; i< html[0].children.length; i++){
                    var column = html[0].children[i];
                    if(column.unique != undefined && column.unique)
                        strJson += ", \"" + column.columnName + "\" : { \"type\": \"NVARCHAR(500)\" } ";
                    else
                        strJson += ", \"" + column.columnName + "\" : { \"type\": \"TEXT\" } ";
                }
                strJson = "{" + strJson + "}";
                console.log(strJson);
                var newTable = sequelize.define(tableName, JSON.parse(strJson));
                sequelize.sync().then(function () {
                    insertAllRecords(newTable, html, socket, function (status) {
                        callback({
                            status: status
                        });
                    });
                });
            }
            else{
                //If updated columns
                var getColumnsQuery = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '"+ tableName +"' ORDER BY ORDINAL_POSITION";
                sequelize.query(getColumnsQuery,
                    { type: sequelize.QueryTypes.SELECT})
                    .then(function(Columns) {
                        console.log(Columns);
                       // if(!(Columns.length - 3) == html[0].children.length) {
                            // Add missing Columns before insertion
                        var strJson =  "\"ItemIdentity\" : { \"type\": \"NVARCHAR(250)\", \"primaryKey\": true } ";
                            for (var i = 0; i < html[0].children.length; i++) {
                                var column = html[0].children[i];
                                if(column.unique != undefined && column.unique)
                                    strJson += ", \"" + column.columnName + "\" : { \"type\": \"NVARCHAR(500)\" } ";
                                else
                                    strJson += ", \"" + column.columnName + "\" : { \"type\": \"TEXT\" } ";
                            }
                            strJson = "{" + strJson + "}";
                            console.log(strJson);
                            var newTable = sequelize.define(tableName, JSON.parse(strJson));
                            sequelize.sync({alter: true}).then(function () {
                                insertAllRecords(newTable, html, socket, function (status) {
                                    callback({
                                        status: status
                                    });
                                });
                            });

                    }) ;
            }

        });

};
