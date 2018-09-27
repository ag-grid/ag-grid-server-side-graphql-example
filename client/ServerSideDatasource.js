import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

class ServerSideDatasource {
  constructor(gridOptions) {
    this.gridOptions = gridOptions;
    this.client = new ApolloClient({uri: "http://localhost:4000/graphql/"});
  }

  getRows(params) {
    let jsonRequest = JSON.stringify(params.request, null, 2);
    console.log(jsonRequest);

    const columns = this.gridOptions.columnDefs;

    // query GraphQL endpoint
    this.client.query(query(params.request, columns))
      .then(response => {
        const rows = response.data.rows;

        // determine last row to size scrollbar and last block size correctly
        let lastRow = -1;
        if (rows.length <= this.gridOptions.cacheBlockSize) {
          lastRow = params.request.startRow + rows.length;
        }

        // pass results to grid
        params.successCallback(rows, lastRow);
      })
      .catch(err => {
        console.error(err);
        params.failCallback()
      });
  }
}

const query = (request, columns) => {

  const fields = columns.map(col => col.field);

  return {
    query: gql`
      query GetRows(
          $start: Int, 
          $end: Int, 
          $sortModel: [SortModel], 
          $groups: [RowGroup], 
          $groupKeys: [String]
        ) {
        rows(
          startRow: $start,    
          endRow: $end,
          sorting: $sortModel,
          rowGroups: $groups, 
          groupKeys: $groupKeys       
        ) {
          ${fields}
        }
      }
    `,
    variables: {
      start: request.startRow,
      end: request.endRow,
      sortModel: request.sortModel,
      groups: request.rowGroupCols,
      groupKeys: request.groupKeys
    },
  }
};

export default ServerSideDatasource;