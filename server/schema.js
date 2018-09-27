import {makeExecutableSchema} from 'graphql-tools';
import {fetchRows} from "./olympicService";

const typeDefs = `
    type OlympicWinner {
      athlete: String 
      country: String
      age: Int   
      sport: String 
      year: Int   
      gold: Int
      silver: Int
      bronze: Int  
    }
   
    type Query {
      rows(
        startRow: Int, 
        endRow: Int, 
        sorting: [SortModel], 
        rowGroups: [RowGroup], 
        groupKeys: [String]
      ): [OlympicWinner]!
    }
    
    input SortModel {
      colId: String
      sort: String    
    }
    
    input RowGroup {
      id: String
      field: String
      displayName: String         
    }
`;

const resolvers = {
  Query: {
    rows: (obj, args) =>
      new Promise((resolve, reject) => {
        const resultCallback = (err, results) => err ? reject(err) : resolve(results);
        fetchRows(args, resultCallback);
      }).then(rows => rows)
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;