package AI_Challenge.AI_Challenge.domain.document.repository;

import AI_Challenge.AI_Challenge.domain.document.entity.Document;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findByFileName(String fileName);

}
