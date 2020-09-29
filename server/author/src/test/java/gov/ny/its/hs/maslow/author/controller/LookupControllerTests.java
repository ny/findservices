package gov.ny.its.hs.maslow.author.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.ny.its.hs.maslow.author.model.Survey;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class LookupControllerTests {
  private static final String QUESTIONS = "/api/author/v1/lookup/questions";

  @Autowired
  private MockMvc mockMvc;

  @Mock
  private Survey survey;

  @Test
  void selectQuestionKeys_returnsOk() throws Exception {
    mockMvc.perform(get(QUESTIONS)).andExpect(status().isOk());
  }
}
