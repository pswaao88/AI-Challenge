package AI_Challenge.AI_Challenge.domain.document.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AccessLevel;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    
    private String fileType;
    
    private String filePath;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] content;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    private LocalDateTime uploadDateTime;
}
