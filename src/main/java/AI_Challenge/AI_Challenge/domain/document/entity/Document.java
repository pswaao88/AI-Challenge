package AI_Challenge.AI_Challenge.domain.document.entity;

import AI_Challenge.AI_Challenge.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Document extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;    // 문서 이름

    @Column(nullable = false)
    private String storedFileName;      // 저장된 파일명

    private String filePath;            // 파일 저장 경로

    @Builder
    public Document(String name, String storedFileName, String filePath) {
        this.name = name;
        this.storedFileName = storedFileName;
        this.filePath = filePath;
    }
}
