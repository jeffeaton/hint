package org.imperial.mrc.hint.userCLI

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.transaction.annotation.Transactional
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext

//The hint db container must be running to run these tests
@ActiveProfiles(profiles=["test"])
@SpringBootTest
@ExtendWith(SpringExtension::class)
@Transactional
open class AppTests
{
    companion object {
        const val TEST_EMAIL = "test@test.com"
    }

    @Autowired
    private lateinit var context: ApplicationContext

    @Test
    open fun `can add user`()
    {
        val sut = UserCLI(context)
        sut.addUser(mapOf("<email>" to TEST_EMAIL, "<password>" to "testpassword"))

        Assertions.assertThat(sut.userExists(mapOf("<email>" to TEST_EMAIL))).isEqualTo("true")
    }

    @Test
    open fun `can remove user`()
    {
        val sut = UserCLI(context)
        sut.addUser(mapOf("<email>" to TEST_EMAIL, "<password>" to "testpassword"))

        sut.removeUser(mapOf("<email>" to TEST_EMAIL))
        Assertions.assertThat(sut.userExists(mapOf("<email>" to TEST_EMAIL))).isEqualTo("false")
    }

    @Test
    open fun `cannot add same user twice`()
    {
        val sut = UserCLI(context)
        sut.addUser(mapOf("<email>" to TEST_EMAIL, "<password>" to "testpassword"))

        //TODO: Make exception class and use this for all exceptions from UserRepository.
        Assertions.assertThatThrownBy { sut.addUser(mapOf("<email>" to TEST_EMAIL, "<password>" to "testpassword")) }
                .hasMessageContaining("duplicate key value")

    }

    @Test
    open fun `cannot remove nonexistent user`()
    {
        val sut = UserCLI(context)
        Assertions.assertThatThrownBy{ sut.removeUser(mapOf("<email>" to "notaperson.@email.com")) }
                .hasMessageContaining("User does not exist")

    }
}