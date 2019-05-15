package org.imperial.mrc.modelserver
import com.github.kittinunf.fuel.core.Headers
import com.github.kittinunf.fuel.httpGet
import com.github.kittinunf.fuel.httpPost
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.ui.set
import org.springframework.web.bind.annotation.*

@Controller
class HomeController {

    @GetMapping("/")
    fun index(model: Model): String {
        model["title"] = "Model Server"
        return "index"
    }

    @PostMapping("/validate")
    @ResponseBody
    fun validate(@ModelAttribute("modelJson")modelJson: String): String {

        val response = "http://localhost:8000/validate"
                .httpPost()
                .header("Content-Type" to "application/json")
                .body(modelJson)
                .response()
                .second

        return response.body().asString("application/json")
    }

    @PostMapping("/run")
    @ResponseBody
    fun run(@ModelAttribute("modelJson")modelJson: String): String {

        val response = "http://localhost:8000/model/submit"
                .httpPost()
                .header("Content-Type" to "application/json")
                .body(modelJson)
                .responseString()
                .second

        return response.body().asString(response.headers[Headers.CONTENT_TYPE].lastOrNull())
    }

    @GetMapping("/status/{id}")
    @ResponseBody
    fun status(@PathVariable("id")id: String): String {

        val response = "http://localhost:8000/model/$id/status"
                .httpGet()
                .responseString()
                .second

        return response.body().asString(response.headers[Headers.CONTENT_TYPE].lastOrNull())
    }

    @GetMapping("/result/{id}")
    @ResponseBody
    fun result(@PathVariable("id")id: String): String {

        val response = "http://localhost:8000/model/$id/result"
                .httpGet()
                .responseString()
                .second

        return response.body().asString("application/json")
    }
}
