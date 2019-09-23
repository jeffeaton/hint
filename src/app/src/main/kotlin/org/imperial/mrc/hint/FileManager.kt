package org.imperial.mrc.hint

import org.apache.tomcat.util.http.fileupload.FileUtils
import org.pac4j.core.config.Config
import org.pac4j.core.context.WebContext
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.File

enum class FileType {

    ANC,
    PJNZ,
    Population,
    Programme,
    Shape,
    Survey;

    override fun toString(): String {
        return this.name.toLowerCase()
    }
}

interface FileManager {
    fun saveFile(file: MultipartFile, type: FileType): String
    fun getFile(type: FileType): File?
    fun getAllFiles(): Map<String, String>
}

@Component
class LocalFileManager(
        private val context: WebContext,
        private val pac4jConfig: Config,
        private val appProperties: AppProperties) : FileManager {

    override fun saveFile(file: MultipartFile, type: FileType): String {
        val id = pac4jConfig.sessionStore.getOrCreateSessionId(context)
        val fileName = file.originalFilename!!
        val path = "${appProperties.uploadDirectory}/$id/$type/$fileName"
        val localFile = File(path)

        if (localFile.parentFile.exists()) {
            FileUtils.cleanDirectory(localFile.parentFile)
        } else {
            FileUtils.forceMkdirParent(localFile)
        }

        localFile.writeBytes(file.bytes)

        return path
    }

    override fun getFile(type: FileType): File? {

        val id = pac4jConfig.sessionStore.getOrCreateSessionId(context)

        val pjnzFiles = File("${appProperties.uploadDirectory}/$id/$type")
                .listFiles()

        return pjnzFiles?.first()
    }

    override fun getAllFiles(): Map<String, String> {

        val id = pac4jConfig.sessionStore.getOrCreateSessionId(context)
        return enumValues<FileType>().associate {
            it.toString() to (File("${appProperties.uploadDirectory}/$id/${it}")
                    .listFiles()?.first()?.path)
        }.filterValues { it != null }
                .mapValues { it.value!! }

    }
}

