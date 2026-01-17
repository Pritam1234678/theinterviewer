package com.example.theinterviewer.repository;

import com.example.theinterviewer.entity.CreditTransaction;
import com.example.theinterviewer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    List<CreditTransaction> findByUserOrderByTimestampDesc(User user);

    List<CreditTransaction> findTop10ByUserOrderByTimestampDesc(User user);
}
