// sql查询
const selectSQL = (sqll) => {
	return new Promise((resolve, reject) => {
		plus.sqlite.selectSql({
			name: 'first',
			sql: sqll,
			success(e) {
				resolve([true, e])
			},
			fail(e) {
				resolve([false, e])
			}
		})
	})
}

// 执行sql
const executeSQL = async (sqll) => {
	return new Promise((resolve, reject) => {
		plus.sqlite.executeSql({
			name: 'first',
			sql: sqll,
			success(e) {
				console.log('executeSQL成功')
				resolve([true, e])
			},
			fail(e) {
				console.log('executeSQL失败', e)
				resolve([false, e])
			}
		});
	})



}

// 初始化数据库，在APP install的时候执行
export const createDb = async () => {
	const [success] = await executeSQL(`CREATE TABLE IF NOT EXISTS t_box (
						          id INTEGER PRIMARY KEY,
						          box_no TEXT,
						          item_no TEXT,
						          status INT(1),
						          type INT(5),
								  order_id INTEGER,
								  create_date TEXT
						        );
						        
						        CREATE INDEX IF NOT EXISTS t_box_box_no_index ON t_box (box_no);
						        CREATE INDEX IF NOT EXISTS t_box_item_no_index ON t_box (item_no);`)

	const [success2, e] = await executeSQL(`CREATE TABLE IF NOT EXISTS t_order (
								      id INTEGER PRIMARY KEY,
								      batch_no TEXT,
								      product_date TEXT,
								      factory_code TEXT,
								      line TEXT,
									  sku TEXT,
									  status INT(1),
								      create_date TEXT
								    );`)


	console.log('初始化数据库', success2, e)
}

const isOpenDB = () => {
	return plus.sqlite.isOpenDatabase({
		name: 'first',
		path: '_doc/test.db'
	})

}

// 打开数据库，在APP启动的时候执行
export const openDb = () => {
	return new Promise((resolve, reject) => {
		const db = isOpenDB();
		if (db) {
			console.log('db', db)
			resolve([true])
			return
		}

		plus.sqlite.openDatabase({
			name: 'first',
			path: '_doc/test.db',
			success(e) {
				console.log('开启成功');
				resolve([true])
			},
			fail(e) {
				resolve([false])
				console.log('开启失败: ' + JSON.stringify(e));
			}
		});
	})


}

export const closeDB = () => {
	return new Promise((resolve, reject) => {
		const db = isOpenDB();
		if (db) {
			console.log('db', db)
			resolve([true])
			return
		}

		plus.sqlite.closeDatabase({
			name: 'first',
			success(e) {
				console.log('关闭成功');
				resolve([true])
			},
			fail(e) {
				resolve([false])
				console.log('关闭失败: ' + JSON.stringify(e));
			}
		});
	})

}

const scanNoExists = async (scanNo, isItem) => {
	const sql = isItem ? 'select 1 from t_box where item_no=\'' + scanNo + '\'' :
		'select 1 from t_box where box_no=\'' + scanNo + '\''
	const [success, result] = await selectSQL(sql)
	return !!result?.length;
}

//新增货物
const insertOneItem = async (orderId, itemNo, type) => {
	const [success, e] = await executeSQL('insert into t_box values(null,\'-1\',\'' + itemNo + '\',0,' +
		type + ',' +
		orderId + ',CURRENT_TIMESTAMP)');
	console.log('新增货物', success, e)


}

//满箱
const oneBoxFull = async (orderId, boxNo, type) => {
	let sqll =
		'select box_no,item_no,status from t_box where type=:type and status=0 and order_id=:orderId';

	sqll = sqll.replace(':type', type).replace(':orderId', orderId)
	await selectSQL(sqll)

	sqll =
		'update t_box set box_no=\':boxNo\',status=1 where status=0 and box_no=\'-1\' and type=:type and order_id=:orderId';
	sqll = sqll.replace(':boxNo', boxNo).replace(':type', type).replace(':orderId', orderId)
	await executeSQL(sqll)
}

const scanNoCheck = async (scanNo, isItem, type) => {
	const sql = isItem ? 'select count(1) as sum from t_box where status=0 and type=' + type :
		'select count(1) as sum from t_box where status=0 and type=' + type;
	const [success, result] = await selectSQL(sql)
	console.log('result', isItem, result)
	return isItem ? (type >= result[0].sum + 1) : (type == result[0].sum)
}

// 扫描箱子、瓶子
export const scanOne = async (orderId, scanNo, type) => {
	debugger
	const isItem = scanNo.startsWith('http');
	const flag = await scanNoExists(scanNo, isItem)
	if (flag) {
		return [false, isItem, '扫描物已存在'];
	}
	const checkflag = await scanNoCheck(scanNo, isItem, type)
	if (!checkflag) {
		return [false, isItem, '扫描数量与实际每箱数量不符'];
	}

	if (isItem) {
		insertOneItem(orderId, scanNo, type);
	} else {
		oneBoxFull(orderId, scanNo, type);
	}
	return [true, isItem, '扫描数量与实际每箱数量不符'];
}

// 创建、编辑订单
export const createOrder = async ({
	batchNo,
	productDate,
	factoryCode,
	line,
	sku
}) => {

	let sqll =
		'insert into t_order values(null,\':batchNo\',\':productDate\',\':factoryCode\',\':line\',\':sku\',0,CURRENT_TIMESTAMP)';
	sqll = sqll.replace(':batchNo', batchNo).replace(':productDate', productDate).replace(
			':factoryCode',
			factoryCode)
		.replace(':line', line).replace(':sku', sku)
	const [success, e] = await executeSQL(sqll)
	return [success, e]
	// return new Promise((resolve, reject) => {

	// })
}

//更新订单
export const updateOrder = ({
	id,
	batchNo,
	productDate,
	factoryCode,
	line,
	sku
}) => {
	let sqll =
		'update t_order set batchNo=\':batchNo\',productDate=\':productDate\',factoryCode=\':factoryCode\',line=\':line\',sku=\':sku\'';
	sqll = sqll.replace(':batchNo', batchNo).replace(':productDate', productDate).replace(':factoryCode',
			factoryCode)
		.replace(':line', line).replace(':sku', sku)
	executeSQL(sqll);
}

//订单列表
export const queryOrderList = async () => {
	const sqll = 'select * from t_order order by create_date desc';
	const [success, result] = await selectSQL(sqll)
	return success ? result : [];
}

//货物列表
export const getAllItem = async ({
	type,
	orderId
}) => {
	var sqll = 'select * from t_box where :orderClause and :typeClause order by create_date';
	if (type) {
		sqll = sqll.replace(':typeClause', 'type = ' + type)
	} else {
		sqll = sqll.replace(':typeClause', '1=1')
	}

	if (orderId) {
		sqll = sqll.replace(':orderClause', 'order_id = ' + orderId)
	} else {
		sqll = sqll.replace(':orderClause', '1=1')
	}
	const [success, result] = await selectSQL(sqll)
	return success ? result : [];
}
