package com.abovesky.calendar.repository;

import com.abovesky.calendar.entity.FamilyList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyListRepository extends JpaRepository<FamilyList, Long> {
    List<FamilyList> findByCreatedBy(Long userId);
    List<FamilyList> findByIsArchivedFalse();
    List<FamilyList> findByIsSharedTrue();
    List<FamilyList> findByType(String type);
}
