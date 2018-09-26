import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

class ServerSideDatasource {
  constructor(gridOptions) {
    this.gridOptions = gridOptions;
    this.client = new ApolloClient({uri: "http://localhost:4000/graphql/"});
  }

  getRows(params) {
    console.log('ag-Grid Request: ', params.request);
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
  return {
    query: gql`
      query GetRows($start: Int, $end: Int, $sortModel: [SortModel], $groups: [RowGroup], $groupKeys: [String]) {
        rows(
          startRow: $start,    
          endRow: $end,
          sorting: $sortModel,
          rowGroups: $groups, 
          groupKeys: $groupKeys       
        ) {
          ${getFields(columns)}
        }
      }
    `,
    variables: {
      start: request.startRow,
      end: request.endRow,
      sortModel: mapSortModel(request),
      groups: mapGroups(request),
      groupKeys: mapGroupKeys(request)
    },
  }
};

const getFields = (columnDefs) => {
  return columnDefs.map(colDef => colDef.field).join();
};

const mapGroups = (request) => {
  return request.rowGroupCols.map(grp => {
    return { colId: grp.field }
  });
};

const mapGroupKeys = (request) => {
  return request.groupKeys.map(key => key.toString());
};

const mapSortModel = (request) => {
  return request.sortModel.map(srt => {
    return { colId: srt.colId, sort: srt.sort }
  });
};

export default ServerSideDatasource;