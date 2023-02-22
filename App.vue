<script>
	import { createDb, openDb, closeDB } from '@/api/index.js'
	export default {
		onLaunch: async function() {
			await openDb()
			createDb()
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
			closeDB()
		},
	}
</script>

<style>
	/*每个页面公共css */
</style>
