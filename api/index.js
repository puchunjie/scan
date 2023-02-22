// sql查询
const selectSQL = (sqll, success, fail) => {
	plus.sqlite.selectSql({
		name: 'first',
		sql: sqll,
		success(e) {
			success?.(e)
		},
		fail(e) {
			fail(e)
		}
	});
}

// 执行sql
const executeSQL = (sqll, success, fail) => {
	plus.sqlite.executeSql({
		name: 'first',
		sql: sqll,
		success(e) {
			success?.(e)
		},
		fail(e) {
			fail(e)
		}
	});

}

// 初始化数据库，在APP install的时候执行
export const createDb = () => {}

// 打开数据库，在APP启动的时候执行
export const openDb = () => {}

// 扫描箱子、瓶子
export const scanOne = () => {}

// 创建、编辑订单
export const createOrder = ({
	batchNo,
	productDate,
	factoryCode,
	line,
	sku
}, success, fail) => {
	let sqll =
		'insert into t_order values(null,\':batchNo\',\':productDate\',\':factoryCode\',\':line\',\':sku\',0,CURRENT_TIMESTAMP)';
	sqll = sqll.replace(':batchNo', batchNo).replace(':productDate', productDate).replace(':factoryCode',
			factoryCode)
		.replace(':line', line).replace(':sku', sku)
	executeSQL(sqll, success, fail)
}

// 订单查询
export const queryOrderList = () => {}
