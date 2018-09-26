import mysql from 'mysql';

const connection = mysql.createConnection({host: 'localhost', user: 'root', password: 'password123'});

export function fetchRows(args, resultCallback) {
  connection.query(buildSql(args), resultCallback);
}

const buildSql = (args) => {
  console.log(args);

  let SQL = select(args) + from() + where(args) + groupBy(args) + orderBy(args) + limit(args);

  console.log(`\n ${SQL} \n`);

  return SQL;
};

const select = args => {
  if (args.rowGroups.length > 0) {
    let groupsToUse = args.rowGroups.slice(args.groupKeys.length, args.groupKeys.length + 1);
    if (groupsToUse.length > 0) {
      return 'SELECT ' + groupsToUse.map(group => group.colId).join(", ") + ', sum(gold) as gold, sum(silver) as silver, sum(bronze) as bronze ';
    }
  }
  return 'SELECT *';
};

const from = () => ' FROM sample_data.olympic_winners';

const where = (args) => {
  let rowGroups = args.rowGroups;
  let groupKeys = args.groupKeys;
  let whereClause = '';
  if (groupKeys) {
    for (let i = 0; i < groupKeys.length; i++) {
      whereClause += (i === 0) ? ' WHERE ' : ' AND ';
      whereClause += `${rowGroups[i].colId} = '${groupKeys[i]}'`;
    }
  }
  return whereClause;
};

const groupBy = (args) => {
  let groupBy = '';
  if (args.rowGroups.length > 0) {
    let groupsToUse = args.rowGroups.slice(args.groupKeys.length, args.groupKeys.length + 1);
    if (groupsToUse.length > 0) {
      groupBy += ' GROUP BY ' + groupsToUse.map(group => group.colId).join(", ");
    }
  }
  return groupBy;
};

const orderBy = (args) => {
  if (args.sorting && args.sorting.length > 0) {
    return ' ORDER BY ' + args.sorting.map(s => `${s.colId} ${s.sort}`).join(', ');
  }
  return '';
};

const limit = (args) => {
  if (args.endRow) {
    let pageSize = args.endRow - args.startRow;
    return ` LIMIT ${args.startRow}, ${pageSize + 1}`;
  }
  return '';
};
