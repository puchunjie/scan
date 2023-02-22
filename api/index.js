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

// 初始化数据库，在APP install的时候执行
export const createDb = () => {}

// 打开数据库，在APP启动的时候执行
export const openDb = () => {}

// 扫描箱子、瓶子
export const scanOne = () => {}

// 创建、编辑订单
export const createOrder = () => {}

// 订单查询
export const queryOrderList = () => {}
