

<a id="module_waffer"></a>
## waffer
Waffer module


* [waffer](#module_waffer)
    * [WafferServer](#exp_module_waffer--WafferServer) ⏏
        * [new WafferServer()](#new_module_waffer--WafferServer_new)
        * [.models()](#module_waffer--WafferServer+models) ⇒ <code>WafferServer</code>
        * [.register_parser(ext, parser)](#module_waffer--WafferServer+register_parser) ⇒ <code>WafferServer</code>
        * [.parser(ext)](#module_waffer--WafferServer+parser) ⇒ <code>function</code>
        * [.listen([port])](#module_waffer--WafferServer+listen) ⇒ <code>WafferServer</code>


<a id="exp_module_waffer--WafferServer"></a>
### WafferServer ⏏
WafferServer class

**Kind**: global class of [<code>waffer</code>](#module_waffer)  

<a id="new_module_waffer--WafferServer_new"></a>
#### new WafferServer()
Initializes logger
Creates fastify server
Initializes default parsers
Creates database connection


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options.logger] | <code>Object</code> | <code>{}</code> | Logger options (pino) |
| [options.prod] | <code>Boolean</code> | <code>false</code> | Production mode |
| [options.debug] | <code>Boolean</code> | <code>false</code> | Debug mode |


<a id="module_waffer--WafferServer+models"></a>
#### server.models() ⇒ <code>WafferServer</code>
Initializes all models
If `debug` flag has been passed then watches files for changes to update schemas

**Kind**: instance method of [<code>WafferServer</code>](#exp_module_waffer--WafferServer)  
**Returns**: <code>WafferServer</code> - Server instance  

<a id="module_waffer--WafferServer+register_parser"></a>
#### server.register_parser(ext, parser) ⇒ <code>WafferServer</code>
Registers parser

**Kind**: instance method of [<code>WafferServer</code>](#exp_module_waffer--WafferServer)  
**Returns**: <code>WafferServer</code> - Returns server instance  

| Param | Type | Description |
| --- | --- | --- |
| ext | <code>string</code> | Patser extension |
| parser | <code>function</code> | Parser Function |


<a id="module_waffer--WafferServer+parser"></a>
#### server.parser(ext) ⇒ <code>function</code>
Returns one for given extension

**Kind**: instance method of [<code>WafferServer</code>](#exp_module_waffer--WafferServer)  
**Returns**: <code>function</code> - Returns parser  

| Param | Type | Description |
| --- | --- | --- |
| ext | <code>string</code> | Patser extension |


<a id="module_waffer--WafferServer+listen"></a>
#### server.listen([port]) ⇒ <code>WafferServer</code>
Listens for connection

**Kind**: instance method of [<code>WafferServer</code>](#exp_module_waffer--WafferServer)  
**Returns**: <code>WafferServer</code> - Returns WafferServer instance  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [port] | <code>Number</code> | <code>0</code> | App port |

