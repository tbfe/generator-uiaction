<?php
/*
 * @author: <%= author %>
 * @time: <%= date %>
 */
class <%= actionName %>Action extends Mo_Core_Action{
    //声明要渲染的模板control路径，也可以在_execute中动态赋值
    protected $strTplName = '<%= tplName %>.php';
    protected $strTplPath = '';

    private $_intParam = 0;

    //必须实现，其内部逻辑拆分自便
    protected function _execute(){
        if ($this->_input()) {
            $this->_process();
        } else {
            //错误处理
        }
    }

    private function _input() {
        //校验参数，获取信息等
        $this->_intParam = intval(Mo_Request::get('param', 0)); //获取param参数
        return true;
    }

    private function _process(){
        //此方法若逻辑较复杂，请自行拆分

        //请求service，service的接口文档请RD提供
        $arrReq = array(
            'param' =>  $this->_intParam,
        );
        $arrRes = Tieba_Service::call('module', 'service', $arrReq);
        //这里可以对service返回的数据进行处理
        $arrRes = do_something_with($arrRes);
        //注册模板变量
        Mo_Response::addViewData('view_date', $arrRes);
    }

    //必须实现
    protected function _log(){
        //如果数据组没有提需求，这里留空即可，这里我们假设这个请求不算pv，故将log中的ispv字段设为0（默认1）
        Tieba_Stlog::addNode('ispv', 0);
    }
}
?>
