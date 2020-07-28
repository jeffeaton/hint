package org.imperial.mrc.hint

import com.fasterxml.jackson.databind.ObjectMapper
import com.github.kittinunf.fuel.Fuel.head
import com.github.kittinunf.fuel.httpDownload
import com.github.kittinunf.fuel.httpPost
import org.imperial.mrc.hint.models.ModelRunOptions
import org.imperial.mrc.hint.models.SnapshotFileWithPath
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody

interface HintrAPIClient {
    fun validateBaselineIndividual(file: SnapshotFileWithPath, type: FileType): ResponseEntity<String>
    fun validateBaselineCombined(files: Map<String, SnapshotFileWithPath?>): ResponseEntity<String>
    fun validateSurveyAndProgramme(file: SnapshotFileWithPath, shapePath: String, type: FileType): ResponseEntity<String>
    fun submit(data: Map<String, SnapshotFileWithPath>, modelRunOptions: ModelRunOptions): ResponseEntity<String>
    fun getStatus(id: String): ResponseEntity<String>
    fun getResult(id: String): ResponseEntity<String>
    fun getPlottingMetadata(iso3: String): ResponseEntity<String>
    fun downloadSpectrum(id: String): ResponseEntity<StreamingResponseBody>
    fun downloadSummary(id: String): ResponseEntity<StreamingResponseBody>
    fun getModelRunOptions(files: Map<String, SnapshotFileWithPath>): ResponseEntity<String>
    fun cancelModelRun(id: String): ResponseEntity<String>
}

@Component
class HintrFuelAPIClient(
        appProperties: AppProperties,
        private val objectMapper: ObjectMapper) : HintrAPIClient, FuelClient(appProperties.apiUrl) {

    private fun getAcceptLanguage(): String {
        val requestAttributes = RequestContextHolder.getRequestAttributes()
        if (requestAttributes is ServletRequestAttributes) {
            return requestAttributes.request.getHeader("Accept-Language") ?: "en"
        }
        return "en"
    }

    override fun standardHeaders(): Map<String, Any> {
        return mapOf("Accept-Language" to getAcceptLanguage())
    }

    override fun validateBaselineIndividual(file: SnapshotFileWithPath,
                                            type: FileType): ResponseEntity<String> {

        val json = objectMapper.writeValueAsString(
                mapOf("type" to type.toString().toLowerCase(),
                        "file" to file))

        return postJson("validate/baseline-individual", json)
    }

    override fun validateSurveyAndProgramme(file: SnapshotFileWithPath,
                                            shapePath: String,
                                            type: FileType): ResponseEntity<String> {

        val json = objectMapper.writeValueAsString(
                mapOf("type" to type.toString().toLowerCase(),
                        "file" to file,
                        "shape" to shapePath))

        return postJson("validate/survey-and-programme", json)
    }

    override fun submit(data: Map<String, SnapshotFileWithPath>, modelRunOptions: ModelRunOptions): ResponseEntity<String> {

        val json = objectMapper.writeValueAsString(
                mapOf("options" to modelRunOptions.options,
                        "version" to modelRunOptions.version,
                        "data" to data))

        return postJson("model/submit", json)
    }

    override fun getStatus(id: String): ResponseEntity<String> {
        return get("model/status/${id}")
    }

    override fun getResult(id: String): ResponseEntity<String> {
        return get("model/result/${id}")
    }

    override fun getPlottingMetadata(iso3: String): ResponseEntity<String> {
        return get("meta/plotting/${iso3}")
    }

    override fun getModelRunOptions(files: Map<String, SnapshotFileWithPath>): ResponseEntity<String> {
        val json = objectMapper.writeValueAsString(files)
        return postJson("model/options", json)
    }

    override fun validateBaselineCombined(files: Map<String, SnapshotFileWithPath?>): ResponseEntity<String> {
        val json = objectMapper.writeValueAsString(
                files.mapValues { it.value?.path }
        )
        return postJson("validate/baseline-combined", json)
    }

    override fun cancelModelRun(id: String): ResponseEntity<String> {
        return "$baseUrl/model/cancel/${id}".httpPost()
                .addTimeouts()
                .response()
                .second
                .asResponseEntity()
    }

    override fun downloadSpectrum(id: String): ResponseEntity<StreamingResponseBody> {
        return "$baseUrl/download/spectrum/${id}"
                .httpDownload()
                .getStreamingResponseEntity(::head)
    }

    override fun downloadSummary(id: String): ResponseEntity<StreamingResponseBody> {
        return "$baseUrl/download/summary/${id}"
                .httpDownload()
                .getStreamingResponseEntity(::head)
    }

}