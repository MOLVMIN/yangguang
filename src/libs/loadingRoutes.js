/**
 * Created by MOLVMIN on 2018/10/14.
 */
export default (url) => () => import(`@/view/${url}.vue`)
