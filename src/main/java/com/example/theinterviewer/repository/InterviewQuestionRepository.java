package com.example.theinterviewer.repository;

import com.example.theinterviewer.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findBySessionId(Long sessionId);

    List<InterviewQuestion> findBySessionIdOrderByCreatedAtAsc(Long sessionId);

    List<InterviewQuestion> findBySessionIdAndRoundType(Long sessionId, InterviewQuestion.RoundType roundType);

    List<InterviewQuestion> findBySessionIdAndUserAnswerIsNull(Long sessionId);
}
